import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { format } from 'date-fns';
import MDEditor from '@uiw/react-md-editor';
import { Controller, useForm } from 'react-hook-form';
import { FiSave } from 'react-icons/fi';
import {
  BlogLocaleResponse,
  ContactSettingsResponse,
  ContactTextDto,
  InquiryTopic,
  UpdateContactSettingsDto,
} from '~/api/api';
import { Button } from '~/components/Button';
import { Input } from '~/components/Input';
import { Loader } from '~/components/Loader';
import { MarkdownEditor } from '~/components/MarkdownEditor';
import { useSidePanelReady } from '~/components/Modal';
import { SegmentedTabs } from '~/components/SegmentedTabs';
import { Switch } from '~/components/Switch';
import { TextArea } from '~/components/TextArea';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useApi } from '~/hooks/useApi';
import { useCan } from '~/hooks/usePermissions';
import { useToast } from '~/hooks/useToast';
import { ALL_TOPICS, TOPIC_LABELS } from '~/routes/Inquiries/labels';
import { mkUseStyles, useTheme } from '~/utils/theme';

const LIMITS = {
  retentionDays: { min: 30, max: 3650 },
  spamRetentionDays: { min: 1, max: 365 },
} as const;

type Text = { intro: string; privacyNotice: string };

const EMPTY_TEXT: Text = { intro: '', privacyNotice: '' };

type FormValues = {
  enabled: boolean;
  administratorName: string;
  administratorEmail: string;
  administratorAddress: string;
  /** Intro and privacy notice per site language. */
  texts: Record<string, Text>;
  topics: InquiryTopic[];
  // Strings, as the app's Input keeps them; converted on save.
  retentionDays: string;
  spamRetentionDays: string;
};

const toValues = (s: ContactSettingsResponse): FormValues => ({
  enabled: s.enabled,
  administratorName: s.administratorName ?? '',
  administratorEmail: s.administratorEmail ?? '',
  administratorAddress: s.administratorAddress ?? '',
  texts: Object.fromEntries(
    s.translations.map((t) => [t.locale, { intro: t.intro ?? '', privacyNotice: t.privacyNotice ?? '' }]),
  ),
  topics: s.topics ?? [],
  retentionDays: String(s.retentionDays),
  spamRetentionDays: String(s.spamRetentionDays),
});

// Filled in field by field: setting one field of a new language leaves the other undefined.
const textOf = (values: FormValues, locale: string): Text => ({
  intro: values.texts?.[locale]?.intro ?? EMPTY_TEXT.intro,
  privacyNotice: values.texts?.[locale]?.privacyNotice ?? EMPTY_TEXT.privacyNotice,
});

const ADMIN_KEYS = ['administratorName', 'administratorEmail', 'administratorAddress'] as const;

/** Only what changed, with emptied text sent as null. */
const toPatch = (next: FormValues, saved: FormValues): UpdateContactSettingsDto => {
  const patch: UpdateContactSettingsDto = {};
  ADMIN_KEYS.forEach((key) => {
    if (next[key].trim() !== saved[key].trim()) patch[key] = next[key].trim() || null;
  });
  // Per language, and within it only the field that changed: a fix to one
  // language's notice must not touch (or re-version) another's.
  const translations: ContactTextDto[] = [];
  new Set([...Object.keys(next.texts ?? {}), ...Object.keys(saved.texts)]).forEach((locale) => {
    const a = textOf(next, locale);
    const b = textOf(saved, locale);
    const entry: ContactTextDto = { locale };
    if (a.intro.trim() !== b.intro.trim()) entry.intro = a.intro.trim() || null;
    if (a.privacyNotice.trim() !== b.privacyNotice.trim()) entry.privacyNotice = a.privacyNotice.trim() || null;
    if (Object.keys(entry).length > 1) translations.push(entry);
  });
  if (translations.length) patch.translations = translations;
  if (next.enabled !== saved.enabled) patch.enabled = next.enabled;
  if ([...next.topics].sort().join() !== [...saved.topics].sort().join()) patch.topics = next.topics;
  if (next.retentionDays !== saved.retentionDays) patch.retentionDays = Number(next.retentionDays);
  if (next.spamRetentionDays !== saved.spamRetentionDays) patch.spamRetentionDays = Number(next.spamRetentionDays);
  return patch;
};

const outOfRange = (value: string, limits: { min: number; max: number }) => {
  const n = Number(value);
  return !value?.trim() || !Number.isInteger(n) || n < limits.min || n > limits.max;
};

/** Placeholders the backend fills in the public notice, as it spells them. */
const NOTICE_VARIABLES = [
  { name: 'administratorName', value: (v: FormValues) => v.administratorName },
  { name: 'administratorEmail', value: (v: FormValues) => v.administratorEmail },
  { name: 'administratorAddress', value: (v: FormValues) => v.administratorAddress },
  { name: 'retentionDays', value: (v: FormValues) => v.retentionDays },
  { name: 'spamRetentionDays', value: (v: FormValues) => v.spamRetentionDays },
] as const;

const PLACEHOLDER = /\{\{\s*([^{}]*?)\s*\}\}/g;

/**
 * The notice as visitors read it — the backend's renderNotice, run on the
 * draft so the preview shows unsaved edits. Unknown placeholders stay visible.
 */
const renderNotice = (text: string, values: FormValues) =>
  text.replace(PLACEHOLDER, (whole, name: string) => {
    const variable = NOTICE_VARIABLES.find((v) => v.name === name);
    return variable ? variable.value(values) ?? '' : whole;
  });

type NoticeGap = {
  /** The placeholder exactly as written, to find it in the text. */
  raw: string;
  name: string;
  /** A known variable whose setting is empty, rather than a template part left to fill. */
  empty: boolean;
};

/** Gaps that would show in the published notice: unknown placeholders, or known ones left empty. */
const noticeGaps = (text: string, values: FormValues): NoticeGap[] => {
  const gaps = new Map<string, NoticeGap>();
  for (const [raw, name] of text.matchAll(PLACEHOLDER)) {
    const variable = NOTICE_VARIABLES.find((v) => v.name === name);
    if (!variable) gaps.set(raw, { raw, name, empty: false });
    else if (!variable.value(values)?.trim()) gaps.set(raw, { raw, name, empty: true });
  }
  return [...gaps.values()];
};

/**
 * What still blocks going live, as the backend counts it: a notice in the
 * default language, and no notice in any language with gaps.
 */
const missingIn = (values: FormValues, defaultLocale: string) => {
  const missing = [
    !values.administratorName.trim() && 'administrator name',
    !values.administratorEmail.trim() && 'administrator email',
    !textOf(values, defaultLocale).privacyNotice.trim() && `privacy notice (${defaultLocale.toUpperCase()})`,
  ].filter(Boolean) as string[];
  const withGaps = Object.keys(values.texts ?? {}).filter(
    (locale) => noticeGaps(textOf(values, locale).privacyNotice, values).length,
  );
  if (withGaps.length) missing.push(`gaps in the ${withGaps.map((l) => l.toUpperCase()).join(', ')} notice`);
  return missing;
};

type ContactFormSettingsModalProps = Partial<InternalModalProps>;

/** The contact form's configuration, in the side card the inbox opens. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const ContactFormSettingsModal = (_p: ContactFormSettingsModalProps) => {
  const styles = useStyles();
  const theme = useTheme();
  const { inquiriesApi, blogLocalesApi } = useApi();
  const can = useCan();
  const canManage = can('inquiry.manage');
  const toast = useToast();
  const panelReady = useSidePanelReady();

  const [settings, setSettings] = useState<ContactSettingsResponse>();
  const [siteLocales, setSiteLocales] = useState<BlogLocaleResponse[]>([]);
  const [activeLocale, setActiveLocale] = useState<string>();
  const [saving, setSaving] = useState(false);
  const noticeRef = useRef<HTMLDivElement>(null);
  const caretLocaleRef = useRef<string>();
  const [noticeMode, setNoticeMode] = useState<'write' | 'preview'>('write');

  const { control, reset, watch, setValue, getValues } = useForm<FormValues>();
  const values = watch();

  useEffect(() => {
    if (!inquiriesApi) return;
    inquiriesApi
      .inquiryControllerGetSettings()
      .then((res) => {
        setSettings(res.data);
        reset(toValues(res.data));
      })
      .catch((e) => console.error('Error loading contact settings:', e));
  }, [inquiriesApi, reset]);

  // The form speaks the languages the blog does; the public list needs no blog permission.
  useEffect(() => {
    if (!blogLocalesApi) return;
    blogLocalesApi
      .localeControllerListPublic()
      .then((res) => setSiteLocales(res.data.locales ?? []))
      .catch((e) => console.error('Error loading site languages:', e));
  }, [blogLocalesApi]);

  const saved = useMemo(() => settings && toValues(settings), [settings]);

  // Clearing a required field takes the form offline rather than failing the save.
  useEffect(() => {
    if (settings && values.enabled && missingIn(values, settings.defaultLocale).length) setValue('enabled', false);
  });

  if (!settings || !saved || !panelReady || values.retentionDays === undefined) {
    return (
      <div style={styles.loading}>
        <Loader />
      </div>
    );
  }

  const defaultLocale = settings.defaultLocale;
  const patch = toPatch(values, saved);
  const dirty = Object.keys(patch).length > 0;
  // From the form, so filling the missing fields unlocks the switch before saving.
  const missing = missingIn(values, defaultLocale);
  const retentionInvalid = outOfRange(values.retentionDays, LIMITS.retentionDays);
  const spamRetentionInvalid = outOfRange(values.spamRetentionDays, LIMITS.spamRetentionDays);

  const locales = siteLocales.length
    ? siteLocales.map((l) => ({ code: l.code, name: l.name }))
    : [defaultLocale, ...settings.translations.map((t) => t.locale).filter((c) => c !== defaultLocale)].map((code) => ({
        code,
        name: code.toUpperCase(),
      }));
  const locale = activeLocale && locales.some((l) => l.code === activeLocale) ? activeLocale : defaultLocale;
  const text = textOf(values, locale);
  const gaps = noticeGaps(text.privacyNotice, values);
  const savedText = settings.translations.find((t) => t.locale === locale);

  const save = async () => {
    if (!inquiriesApi || !dirty) return;
    if (retentionInvalid || spamRetentionInvalid) {
      toast('Check the retention periods.', 'error');
      return;
    }
    setSaving(true);
    try {
      const { data } = await inquiriesApi.inquiryControllerUpdateSettings({ updateContactSettingsDto: patch });
      setSettings(data);
      reset(toValues(data));
      toast('Contact form saved', 'success');
    } catch (e) {
      const raw = (e as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      toast((Array.isArray(raw) ? raw.join(', ') : raw) || 'Could not save the contact form.', 'error');
    } finally {
      setSaving(false);
    }
  };

  /** Puts a placeholder where the caret was in the notice, or at its end. */
  const insertVariable = (token: string) => {
    const field = `texts.${locale}.privacyNotice` as const;
    const current = getValues(field) ?? '';
    const textarea = noticeRef.current?.querySelector('textarea');
    // A textarea keeps its selection after losing focus; until the notice was
    // clicked into, there is no caret to honour and the end is used.
    const known = textarea && caretLocaleRef.current === locale;
    const at = known ? textarea.selectionStart : current.length;
    const end = known ? textarea.selectionEnd : current.length;
    setValue(field, current.slice(0, at) + token + current.slice(end), { shouldDirty: true });
    requestAnimationFrame(() => {
      const el = noticeRef.current?.querySelector('textarea');
      if (!el) return;
      el.focus();
      el.setSelectionRange(at + token.length, at + token.length);
    });
  };

  /** Selects a template gap in the editor, so typing replaces it. */
  const selectInNotice = (raw: string) => {
    const textarea = noticeRef.current?.querySelector('textarea');
    if (!textarea) return;
    const at = textarea.value.indexOf(raw);
    if (at < 0) return;
    textarea.focus();
    textarea.setSelectionRange(at, at + raw.length);
    // Bring the selection into view: a long notice scrolls inside the editor.
    const line = textarea.value.slice(0, at).split('\n').length;
    const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight) || 20;
    const scroller = textarea.closest('.w-md-editor-area') as HTMLElement | null;
    if (scroller) scroller.scrollTop = Math.max(0, (line - 3) * lineHeight);
  };

  const toggleTopic = (topic: InquiryTopic) =>
    setValue(
      'topics',
      values.topics.includes(topic) ? values.topics.filter((t) => t !== topic) : [...values.topics, topic],
    );

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <div style={styles.topInfo}>
          <span style={{ ...styles.stateTag, ...(settings.enabled ? styles.stateLive : {}) }}>
            {settings.enabled ? 'Live' : 'Off'}
          </span>
          <span style={styles.meta}>Updated {format(new Date(settings.updatedAt), 'd MMM yyyy, HH:mm')}</span>
        </div>
        {canManage ? (
          <Button
            label='Save'
            icon={<FiSave size={15} />}
            onClick={save}
            loading={saving}
            disabled={!dirty || saving}
          />
        ) : null}
      </div>

      <div style={styles.columns}>
        <div style={styles.column}>
          <Section title='Form'>
            <div style={styles.switchRow}>
              <div style={styles.switchText}>
                <span style={styles.switchLabel}>Accept messages</span>
                {missing.length ? <span style={styles.missing}>Needs {missing.join(', ')}</span> : null}
              </div>
              <Controller
                control={control}
                name='enabled'
                render={({ field }) => (
                  <Switch
                    checked={!!field.value}
                    onChange={field.onChange}
                    disabled={!canManage || missing.length > 0}
                  />
                )}
              />
            </div>
            <div style={styles.chips}>
              <button
                type='button'
                disabled={!canManage}
                style={{ ...styles.chip, ...(values.topics.length === 0 ? styles.chipOn : {}) }}
                onClick={() => setValue('topics', [])}
              >
                All topics
              </button>
              {ALL_TOPICS.map((topic) => (
                <button
                  key={topic}
                  type='button'
                  disabled={!canManage}
                  style={{ ...styles.chip, ...(values.topics.includes(topic) ? styles.chipOn : {}) }}
                  onClick={() => toggleTopic(topic)}
                >
                  {TOPIC_LABELS[topic]}
                </button>
              ))}
            </div>
          </Section>

          <Section title='Administrator'>
            <Input
              control={control}
              name='administratorName'
              label='Name'
              description='{{administratorName}} in the notice'
            />
            <Input
              control={control}
              name='administratorEmail'
              label='Email'
              type='email'
              description='{{administratorEmail}} in the notice'
            />
            <Input
              control={control}
              name='administratorAddress'
              label='Address'
              description='{{administratorAddress}} in the notice'
            />
          </Section>

          <Section title='Retention'>
            <div style={styles.pair}>
              <Input
                control={control}
                name='retentionDays'
                label='Messages, days'
                type='number'
                description={`${LIMITS.retentionDays.min}–${LIMITS.retentionDays.max}`}
                style={styles.pairItem}
              />
              <Input
                control={control}
                name='spamRetentionDays'
                label='Spam, days'
                type='number'
                description={`${LIMITS.spamRetentionDays.min}–${LIMITS.spamRetentionDays.max}`}
                style={styles.pairItem}
              />
            </div>
            {retentionInvalid || spamRetentionInvalid ? (
              <span style={styles.error}>
                Messages {LIMITS.retentionDays.min}–{LIMITS.retentionDays.max}, spam {LIMITS.spamRetentionDays.min}–
                {LIMITS.spamRetentionDays.max} days
              </span>
            ) : null}
          </Section>
        </div>

        <div style={{ ...styles.column, ...styles.wideColumn }}>
          <Section
            title='Page text'
            meta={
              savedText?.privacyNoticeVersion
                ? `${locale.toUpperCase()} notice v${savedText.privacyNoticeVersion}${
                    savedText.privacyNoticeUpdatedAt
                      ? ` · ${format(new Date(savedText.privacyNoticeUpdatedAt), 'd MMM yyyy')}`
                      : ''
                  }`
                : undefined
            }
            action={
              <div style={styles.langTabs}>
                {locales.map((l) => {
                  const active = l.code === locale;
                  const notice = textOf(values, l.code).privacyNotice;
                  const hasNotice = Boolean(notice.trim());
                  const hasGaps = noticeGaps(notice, values).length > 0;
                  return (
                    <button
                      key={l.code}
                      type='button'
                      title={l.name}
                      style={{ ...styles.langTab, ...(active ? styles.langTabOn : {}) }}
                      onClick={() => setActiveLocale(l.code)}
                    >
                      {l.code.toUpperCase()}
                      <span
                        style={{
                          ...styles.langDot,
                          backgroundColor: hasGaps
                            ? theme.colors.red
                            : hasNotice
                              ? theme.colors.lightGreen
                              : l.code === defaultLocale
                                ? theme.colors.red
                                : theme.colors.yellow,
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            }
          >
            <TextArea
              key={`intro-${locale}`}
              control={control}
              name={`texts.${locale}.intro`}
              label={`Intro (${locale.toUpperCase()})`}
              description='Above the form'
              rows={3}
            />

            <div style={styles.noticeHeader}>
              <div style={styles.noticeTitle}>
                <span style={styles.noticeLabel}>Privacy notice ({locale.toUpperCase()})</span>
                {locale !== defaultLocale && !text.privacyNotice.trim() ? (
                  <span style={styles.fallback}>Visitors see the {defaultLocale.toUpperCase()} notice</span>
                ) : null}
              </div>
              {canManage ? (
                <SegmentedTabs
                  layoutId='notice-mode'
                  items={[
                    { value: 'write', label: 'Write' },
                    { value: 'preview', label: 'Preview' },
                  ]}
                  selected={noticeMode}
                  handleSelect={(value) => setNoticeMode(value as 'write' | 'preview')}
                />
              ) : null}
            </div>
            {canManage && noticeMode === 'write' ? (
              <div style={styles.variables}>
                {NOTICE_VARIABLES.map((v) => (
                  <button
                    key={v.name}
                    type='button'
                    title={v.value(values)?.trim() || 'Not filled in yet'}
                    style={styles.variable}
                    // Keeps the caret in the editor instead of moving focus to the button.
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => insertVariable(`{{${v.name}}}`)}
                  >
                    {`{{${v.name}}}`}
                  </button>
                ))}
              </div>
            ) : null}
            {gaps.length && noticeMode === 'write' ? (
              <div style={styles.gaps}>
                <span style={styles.gapsLabel}>Fill in before going live</span>
                {gaps.map((gap) => (
                  <button
                    key={gap.raw}
                    type='button'
                    title={gap.empty ? 'Its setting is empty' : 'Select it in the text'}
                    style={styles.gap}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => (gap.empty ? undefined : selectInNotice(gap.raw))}
                  >
                    {gap.empty ? `{{${gap.name}}} is empty` : gap.name}
                  </button>
                ))}
              </div>
            ) : null}
            {canManage && noticeMode === 'preview' ? (
              <div data-color-mode='dark' style={styles.preview}>
                <MDEditor.Markdown source={renderNotice(text.privacyNotice, values)} style={styles.previewBody} />
              </div>
            ) : null}
            <div
              ref={noticeRef}
              onFocus={() => (caretLocaleRef.current = locale)}
              style={canManage && noticeMode === 'preview' ? styles.hidden : undefined}
            >
              <Controller
                key={`notice-${locale}`}
                control={control}
                name={`texts.${locale}.privacyNotice`}
                render={({ field }) =>
                  canManage ? (
                    <MarkdownEditor value={field.value ?? ''} onChange={field.onChange} height={460} preview='edit' />
                  ) : (
                    <span style={{ color: theme.colors.white, whiteSpace: 'pre-wrap' }}>{field.value}</span>
                  )
                }
              />
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
};

const Section = ({
  title,
  meta,
  action,
  children,
}: {
  title: string;
  meta?: string;
  action?: ReactNode;
  children: ReactNode;
}) => {
  const styles = useStyles();
  return (
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        <div style={styles.sectionTitleRow}>
          <span style={styles.sectionTitle}>{title}</span>
          {meta ? <span style={styles.meta}>{meta}</span> : null}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: t.spacing.xl },
  container: { gap: t.spacing.m },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.m,
  },
  topInfo: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.s },
  stateTag: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    padding: '3px 10px',
    borderRadius: 999,
    color: t.colors.dark05,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
  },
  stateLive: { color: t.colors.lightGreen, backgroundColor: t.colors.lightGreen + t.colorOpacity(0.14) },
  meta: { fontSize: 12, color: t.colors.dark05 },
  columns: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', gap: t.spacing.m },
  column: { flex: '1 1 340px', minWidth: 0, gap: t.spacing.m },
  wideColumn: { flex: '1.6 1 480px' },
  section: {
    gap: t.spacing.m,
    padding: t.spacing.l,
    borderRadius: t.borderRadius.large,
    backgroundColor: t.colors.gray03 + t.colorOpacity(0.7),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: t.spacing.m,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'baseline', gap: t.spacing.s },
  sectionTitle: { fontSize: 16, fontWeight: 700, color: t.colors.white },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.spacing.l },
  switchText: { gap: 2 },
  switchLabel: { fontWeight: 600, color: t.colors.white },
  missing: { fontSize: 13, color: t.colors.yellow },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.xs },
  chip: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    height: 30,
    padding: '0 12px',
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    color: t.colors.dark05,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: t.colors.dark04 + t.colorOpacity(0.5),
  },
  chipOn: {
    color: t.colors.white,
    borderColor: t.colors.blue,
    backgroundColor: t.colors.blue + t.colorOpacity(0.18),
  },
  pair: { flexDirection: 'row', gap: t.spacing.m },
  pairItem: { flex: 1, minWidth: 0 },
  error: { fontSize: 12, color: t.colors.red, marginTop: -t.spacing.s },
  langTabs: { flexDirection: 'row', gap: 4 },
  langTab: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 30,
    padding: '0 10px',
    border: 'none',
    borderRadius: t.borderRadius.default,
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: 0.5,
    cursor: 'pointer',
    color: t.colors.dark05,
    backgroundColor: 'transparent',
  },
  langTabOn: { color: t.colors.white, backgroundColor: t.colors.blue + t.colorOpacity(0.25) },
  langDot: { width: 6, height: 6, borderRadius: '50%' },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.s,
    flexWrap: 'wrap',
  },
  noticeTitle: { flexDirection: 'row', alignItems: 'baseline', gap: t.spacing.s, flexWrap: 'wrap' },
  hidden: { display: 'none' },
  preview: {
    minHeight: 460,
    maxHeight: 640,
    overflowY: 'auto',
    padding: t.spacing.l,
    boxSizing: 'border-box',
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.4),
  },
  previewBody: { background: 'transparent', fontSize: 15 },
  noticeLabel: { fontSize: 12, fontWeight: 700, color: t.colors.blue04 },
  fallback: { fontSize: 12, color: t.colors.yellow },
  gaps: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
  gapsLabel: { fontSize: 12, fontWeight: 700, color: t.colors.red, marginRight: 2 },
  gap: {
    maxWidth: '100%',
    minHeight: 26,
    padding: '3px 10px',
    border: 'none',
    borderRadius: 999,
    fontSize: 12,
    textAlign: 'left',
    cursor: 'pointer',
    color: t.colors.red,
    backgroundColor: t.colors.red + t.colorOpacity(0.12),
  },
  variables: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: -t.spacing.s },
  variable: {
    height: 26,
    padding: '0 10px',
    border: 'none',
    borderRadius: 999,
    fontSize: 12,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    cursor: 'pointer',
    color: t.colors.blue04,
    backgroundColor: t.colors.blue04 + t.colorOpacity(0.14),
  },
}));
