import { ReactNode, useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { FiFileText, FiSave } from 'react-icons/fi';
import { ContactSettingsResponse, InquiryTopic, UpdateContactSettingsDto } from '~/api/api';
import { Button } from '~/components/Button';
import { Loader } from '~/components/Loader';
import { MarkdownEditor } from '~/components/MarkdownEditor';
import { PageHeader } from '~/components/PageHeader';
import { Switch } from '~/components/Switch';
import { useApi } from '~/hooks/useApi';
import { useCan } from '~/hooks/usePermissions';
import { useToast } from '~/hooks/useToast';
import { ALL_TOPICS, TOPIC_LABELS } from '~/routes/Inquiries/labels';
import { privacyNoticeFromTemplate } from '~/routes/Inquiries/privacyTemplate';
import { mkUseStyles, useTheme } from '~/utils/theme';

const LIMITS = {
  retentionDays: { min: 30, max: 3650 },
  spamRetentionDays: { min: 1, max: 365 },
} as const;

const MISSING_LABELS: Record<string, string> = {
  administratorName: 'administrator name',
  administratorEmail: 'administrator email',
  privacyNotice: 'privacy notice',
};

type Draft = {
  enabled: boolean;
  administratorName: string;
  administratorEmail: string;
  administratorAddress: string;
  privacyNotice: string;
  intro: string;
  topics: InquiryTopic[];
  retentionDays: string;
  spamRetentionDays: string;
};

const toDraft = (s: ContactSettingsResponse): Draft => ({
  enabled: s.enabled,
  administratorName: s.administratorName ?? '',
  administratorEmail: s.administratorEmail ?? '',
  administratorAddress: s.administratorAddress ?? '',
  privacyNotice: s.privacyNotice ?? '',
  intro: s.intro ?? '',
  topics: s.topics ?? [],
  retentionDays: String(s.retentionDays),
  spamRetentionDays: String(s.spamRetentionDays),
});

const TEXT_KEYS = [
  'administratorName',
  'administratorEmail',
  'administratorAddress',
  'privacyNotice',
  'intro',
] as const;

/** Only what changed, with emptied text sent as null. */
const toPatch = (draft: Draft, saved: Draft): UpdateContactSettingsDto => {
  const patch: UpdateContactSettingsDto = {};
  TEXT_KEYS.forEach((key) => {
    if (draft[key].trim() !== saved[key].trim()) patch[key] = draft[key].trim() || null;
  });
  if (draft.enabled !== saved.enabled) patch.enabled = draft.enabled;
  if ([...draft.topics].sort().join() !== [...saved.topics].sort().join()) patch.topics = draft.topics;
  if (draft.retentionDays !== saved.retentionDays) patch.retentionDays = Number(draft.retentionDays);
  if (draft.spamRetentionDays !== saved.spamRetentionDays) patch.spamRetentionDays = Number(draft.spamRetentionDays);
  return patch;
};

const rangeError = (value: string, limits: { min: number; max: number }) => {
  const n = Number(value);
  return !value.trim() || !Number.isInteger(n) || n < limits.min || n > limits.max;
};

export const ContactFormSettings = () => {
  const styles = useStyles();
  const theme = useTheme();
  const { inquiriesApi } = useApi();
  const can = useCan();
  const canManage = can('inquiry.manage');
  const toast = useToast();

  const [settings, setSettings] = useState<ContactSettingsResponse>();
  const [draft, setDraft] = useState<Draft>();
  const [saving, setSaving] = useState(false);
  const [confirmTemplate, setConfirmTemplate] = useState(false);

  useEffect(() => {
    if (!inquiriesApi) return;
    inquiriesApi
      .inquiryControllerGetSettings()
      .then((res) => {
        setSettings(res.data);
        setDraft(toDraft(res.data));
      })
      .catch((e) => console.error('Error loading contact settings:', e));
  }, [inquiriesApi]);

  useEffect(() => {
    if (!confirmTemplate) return;
    const timer = window.setTimeout(() => setConfirmTemplate(false), 4000);
    return () => window.clearTimeout(timer);
  }, [confirmTemplate]);

  const saved = useMemo(() => settings && toDraft(settings), [settings]);
  const patch = draft && saved ? toPatch(draft, saved) : {};
  const dirty = Object.keys(patch).length > 0;

  // From the draft, so filling the missing fields unlocks the switch before saving.
  const missing = draft
    ? (['administratorName', 'administratorEmail', 'privacyNotice'] as const).filter((key) => !draft[key].trim())
    : [];

  if (!draft || !settings) {
    return (
      <div style={styles.page}>
        <PageHeader title='Contact form' />
        <Loader />
      </div>
    );
  }

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((prev) => {
      if (!prev) return prev;
      const next = { ...prev, [key]: value };
      // Clearing a required field takes the form offline rather than failing the save.
      return next.enabled && missingIn(next) ? { ...next, enabled: false } : next;
    });

  const retentionInvalid = rangeError(draft.retentionDays, LIMITS.retentionDays);
  const spamRetentionInvalid = rangeError(draft.spamRetentionDays, LIMITS.spamRetentionDays);

  const insertTemplate = () => {
    if (draft.privacyNotice.trim() && !confirmTemplate) {
      setConfirmTemplate(true);
      return;
    }
    setConfirmTemplate(false);
    set(
      'privacyNotice',
      privacyNoticeFromTemplate({
        administratorName: draft.administratorName,
        administratorEmail: draft.administratorEmail,
        administratorAddress: draft.administratorAddress,
        retentionDays: retentionInvalid ? settings.retentionDays : Number(draft.retentionDays),
        spamRetentionDays: spamRetentionInvalid ? settings.spamRetentionDays : Number(draft.spamRetentionDays),
      }),
    );
  };

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
      setDraft(toDraft(data));
      toast('Contact form saved', 'success');
    } catch (e) {
      const raw = (e as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      toast((Array.isArray(raw) ? raw.join(', ') : raw) || 'Could not save the contact form.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleTopic = (topic: InquiryTopic) =>
    set('topics', draft.topics.includes(topic) ? draft.topics.filter((t) => t !== topic) : [...draft.topics, topic]);

  return (
    <div style={styles.scroll}>
      <div style={styles.page}>
        <PageHeader
          title='Contact form'
          badges={
            <span style={{ ...styles.stateTag, ...(settings.enabled ? styles.stateLive : {}) }}>
              {settings.enabled ? 'Live' : 'Off'}
            </span>
          }
          meta={`Updated ${format(new Date(settings.updatedAt), 'd MMM yyyy, HH:mm')}`}
          actions={
            canManage ? (
              <Button
                label='Save'
                icon={<FiSave size={15} />}
                onClick={save}
                loading={saving}
                disabled={!dirty || saving}
              />
            ) : null
          }
        />

        <Card title='Form'>
          <div style={styles.switchRow}>
            <div style={styles.switchText}>
              <span style={styles.switchLabel}>Accept messages</span>
              {missing.length ? (
                <span style={styles.missing}>Needs {missing.map((key) => MISSING_LABELS[key]).join(', ')}</span>
              ) : null}
            </div>
            <Switch
              checked={draft.enabled}
              onChange={(value) => set('enabled', value)}
              disabled={!canManage || missing.length > 0}
            />
          </div>

          <Field label='Intro'>
            <textarea
              value={draft.intro}
              onChange={(e) => set('intro', e.target.value)}
              rows={3}
              maxLength={2000}
              disabled={!canManage}
              style={styles.textarea}
            />
          </Field>

          <Field label='Topics'>
            <div style={styles.chips}>
              <button
                type='button'
                disabled={!canManage}
                style={{ ...styles.chip, ...(draft.topics.length === 0 ? styles.chipOn : {}) }}
                onClick={() => set('topics', [])}
              >
                All topics
              </button>
              {ALL_TOPICS.map((topic) => (
                <button
                  key={topic}
                  type='button'
                  disabled={!canManage}
                  style={{ ...styles.chip, ...(draft.topics.includes(topic) ? styles.chipOn : {}) }}
                  onClick={() => toggleTopic(topic)}
                >
                  {TOPIC_LABELS[topic]}
                </button>
              ))}
            </div>
          </Field>
        </Card>

        <Card title='Administrator'>
          <div style={styles.grid}>
            <Field label='Name'>
              <input
                value={draft.administratorName}
                onChange={(e) => set('administratorName', e.target.value)}
                maxLength={200}
                disabled={!canManage}
                style={styles.input}
              />
            </Field>
            <Field label='Email'>
              <input
                type='email'
                value={draft.administratorEmail}
                onChange={(e) => set('administratorEmail', e.target.value)}
                maxLength={254}
                disabled={!canManage}
                style={styles.input}
              />
            </Field>
          </div>
          <Field label='Address'>
            <input
              value={draft.administratorAddress}
              onChange={(e) => set('administratorAddress', e.target.value)}
              maxLength={500}
              disabled={!canManage}
              style={styles.input}
            />
          </Field>
        </Card>

        <Card
          title='Privacy notice'
          meta={
            settings.privacyNoticeVersion
              ? `v${settings.privacyNoticeVersion}${
                  settings.privacyNoticeUpdatedAt
                    ? ` · ${format(new Date(settings.privacyNoticeUpdatedAt), 'd MMM yyyy')}`
                    : ''
                }`
              : undefined
          }
          action={
            canManage ? (
              <Button
                label={confirmTemplate ? 'Replace the current text?' : 'Insert template'}
                variant={confirmTemplate ? 'danger' : 'secondary'}
                icon={<FiFileText size={15} />}
                onClick={insertTemplate}
              />
            ) : null
          }
        >
          {canManage ? (
            <MarkdownEditor
              value={draft.privacyNotice}
              onChange={(value) => set('privacyNotice', value)}
              height={420}
              preview='edit'
            />
          ) : (
            <span style={{ color: theme.colors.white, whiteSpace: 'pre-wrap' }}>{draft.privacyNotice}</span>
          )}
        </Card>

        <Card title='Retention'>
          <div style={styles.grid}>
            <Field
              label='Messages'
              hint={`${LIMITS.retentionDays.min}–${LIMITS.retentionDays.max} days`}
              error={retentionInvalid}
            >
              <DaysInput
                value={draft.retentionDays}
                onChange={(value) => set('retentionDays', value)}
                limits={LIMITS.retentionDays}
                disabled={!canManage}
                invalid={retentionInvalid}
              />
            </Field>
            <Field
              label='Spam'
              hint={`${LIMITS.spamRetentionDays.min}–${LIMITS.spamRetentionDays.max} days`}
              error={spamRetentionInvalid}
            >
              <DaysInput
                value={draft.spamRetentionDays}
                onChange={(value) => set('spamRetentionDays', value)}
                limits={LIMITS.spamRetentionDays}
                disabled={!canManage}
                invalid={spamRetentionInvalid}
              />
            </Field>
          </div>
        </Card>
      </div>
    </div>
  );
};

const missingIn = (draft: Draft) =>
  !draft.administratorName.trim() || !draft.administratorEmail.trim() || !draft.privacyNotice.trim();

const Card = ({
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
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <div style={styles.cardTitleRow}>
          <span style={styles.cardTitle}>{title}</span>
          {meta ? <span style={styles.cardMeta}>{meta}</span> : null}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
};

const Field = ({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: boolean;
  children: ReactNode;
}) => {
  const styles = useStyles();
  const theme = useTheme();
  return (
    <label style={styles.field}>
      <span style={styles.fieldLabel}>
        {label}
        {hint ? (
          <span style={{ ...styles.fieldHint, color: error ? theme.colors.red : theme.colors.dark05 }}>{hint}</span>
        ) : null}
      </span>
      {children}
    </label>
  );
};

const DaysInput = ({
  value,
  onChange,
  limits,
  disabled,
  invalid,
}: {
  value: string;
  onChange: (value: string) => void;
  limits: { min: number; max: number };
  disabled?: boolean;
  invalid?: boolean;
}) => {
  const styles = useStyles();
  const theme = useTheme();
  return (
    <div style={styles.daysWrap}>
      <input
        type='number'
        inputMode='numeric'
        min={limits.min}
        max={limits.max}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        style={{
          ...styles.input,
          ...styles.daysInput,
          ...(invalid ? { boxShadow: `inset 0 0 0 1px ${theme.colors.red}` } : {}),
        }}
      />
      <span style={styles.daysSuffix}>days</span>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  scroll: { flex: 1, width: '100%', height: '100%', minHeight: 0, overflowY: 'auto' },
  page: {
    width: '100%',
    maxWidth: 820,
    marginLeft: 'auto',
    marginRight: 'auto',
    gap: t.spacing.m,
    paddingBottom: t.spacing.l,
  },
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
  card: {
    gap: t.spacing.m,
    padding: t.spacing.l,
    borderRadius: t.borderRadius.large,
    backgroundColor: t.colors.gray03 + t.colorOpacity(0.7),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.m,
    minHeight: 36,
  },
  cardTitleRow: { flexDirection: 'row', alignItems: 'baseline', gap: t.spacing.s },
  cardTitle: { fontSize: 16, fontWeight: 700, color: t.colors.white },
  cardMeta: { fontSize: 12, color: t.colors.dark05 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.spacing.l },
  switchText: { gap: 2 },
  switchLabel: { fontWeight: 600, color: t.colors.white },
  missing: { fontSize: 13, color: t.colors.yellow },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: t.spacing.m },
  field: { display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 },
  fieldLabel: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: t.spacing.s,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: t.colors.blue04,
  },
  fieldHint: { fontSize: 12, fontWeight: 400, letterSpacing: 0, textTransform: 'none' },
  input: {
    height: 44,
    padding: `0 ${t.spacing.m}px`,
    boxSizing: 'border-box',
    fontSize: 15,
    fontFamily: 'inherit',
    color: t.colors.white,
    border: 'none',
    outline: 'none',
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
    width: '100%',
  },
  textarea: {
    resize: 'vertical',
    padding: t.spacing.m,
    fontSize: 15,
    fontFamily: 'inherit',
    lineHeight: 1.5,
    color: t.colors.white,
    border: 'none',
    outline: 'none',
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
  },
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
  daysWrap: { position: 'relative' },
  daysInput: { paddingRight: 56 },
  daysSuffix: {
    position: 'absolute',
    right: t.spacing.m,
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: 13,
    color: t.colors.dark05,
    pointerEvents: 'none',
  },
}));
