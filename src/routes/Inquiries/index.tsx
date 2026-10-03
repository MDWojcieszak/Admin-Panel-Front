import { useCallback, useEffect, useRef, useState } from 'react';
import { differenceInCalendarDays, format, formatDistanceToNow, isThisYear, isToday, isYesterday } from 'date-fns';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import {
  FiArchive,
  FiCornerUpLeft,
  FiInbox,
  FiMail,
  FiPhone,
  FiSearch,
  FiSettings,
  FiSlash,
  FiTrash2,
  FiX,
} from 'react-icons/fi';
import { InquiryResponse, InquiryStatus, InquirySummaryResponse, InquiryTopic } from '~/api/api';
import { Button } from '~/components/Button';
import { EmptyState } from '~/components/EmptyState';
import { Loader } from '~/components/Loader';
import { PageHeader } from '~/components/PageHeader';
import { SegmentedTabs } from '~/components/SegmentedTabs';
import { TextArea } from '~/components/TextArea';
import { useApi } from '~/hooks/useApi';
import { notifyInquiriesChanged } from '~/hooks/useInquiryUnread';
import { useModal } from '~/hooks/useModal';
import { useCan } from '~/hooks/usePermissions';
import { useToast } from '~/hooks/useToast';
import { useUrlParams } from '~/hooks/useUrlParam';
import { MainNavigationRoute } from '~/navigation/types';
import { imgUrl } from '~/routes/Galleries/utils';
import { ALL_TOPICS, STATUS_LABELS, TOPIC_LABELS } from '~/routes/Inquiries/labels';
import { ContactFormSettingsModal } from '~/routes/Inquiries/modals/ContactFormSettingsModal';
import { mkUseStyles, useTheme } from '~/utils/theme';

type Box = 'inbox' | 'archived' | 'spam';

const BOX_STATUS: Record<Box, InquiryStatus | undefined> = {
  // No status: the backend's inbox is everything but archived and spam.
  inbox: undefined,
  archived: InquiryStatus.Archived,
  spam: InquiryStatus.Spam,
};

/** Statuses that belong to each box, to drop a message that moved out of it. */
const inBox = (box: Box, status: InquiryStatus) =>
  box === 'inbox' ? status !== InquiryStatus.Archived && status !== InquiryStatus.Spam : BOX_STATUS[box] === status;

// The backend's PaginationDto caps take at 20; more is a 400.
const PAGE = 20;

const shortDate = (iso: string) => {
  const date = new Date(iso);
  if (isToday(date)) return format(date, 'HH:mm');
  return format(date, isThisYear(date) ? 'd MMM' : 'd MMM yyyy');
};

/** Sections of the list, newest first: Today, Yesterday, This week, then by month. */
const dayGroup = (iso: string) => {
  const date = new Date(iso);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  if (differenceInCalendarDays(new Date(), date) < 7) return 'This week';
  return format(date, isThisYear(date) ? 'MMMM' : 'MMMM yyyy');
};

const groupByDay = (items: InquiryResponse[]) =>
  items.reduce<{ label: string; items: InquiryResponse[] }[]>((groups, item) => {
    const label = dayGroup(item.createdAt);
    const last = groups[groups.length - 1];
    if (last?.label === label) last.items.push(item);
    else groups.push({ label, items: [item] });
    return groups;
  }, []);

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || '?';

const AVATAR_COLORS = ['blue', 'purple02', 'lightGreen', 'yellow', 'mainGreen', 'red'] as const;

/** Same sender, same colour: picked from the name, not stored. */
const avatarColor = (name: string) =>
  AVATAR_COLORS[[...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % AVATAR_COLORS.length];

const Avatar = ({ name, size, unread }: { name: string; size: number; unread?: boolean }) => {
  const styles = useStyles();
  const theme = useTheme();
  const color = theme.colors[avatarColor(name)];
  return (
    <span
      style={{
        ...styles.avatar,
        width: size,
        height: size,
        fontSize: Math.round(size * 0.38),
        color,
        backgroundColor: color + theme.colorOpacity(0.18),
      }}
    >
      {initials(name)}
      {unread ? <span style={styles.avatarDot} /> : null}
    </span>
  );
};

const StatusPill = ({ status }: { status: InquiryStatus }) => {
  const styles = useStyles();
  const theme = useTheme();
  const color =
    status === InquiryStatus.New
      ? theme.colors.blue
      : status === InquiryStatus.Answered
        ? theme.colors.lightGreen
        : status === InquiryStatus.Spam
          ? theme.colors.red
          : theme.colors.dark05;
  return (
    <span style={{ ...styles.pill, color, backgroundColor: color + theme.colorOpacity(0.14) }}>
      {STATUS_LABELS[status]}
    </span>
  );
};

const InquiryRow = ({ inquiry, active, onOpen }: { inquiry: InquiryResponse; active: boolean; onOpen: () => void }) => {
  const styles = useStyles();
  const theme = useTheme();
  const [hovered, setHovered] = useState(false);
  const unread = inquiry.status === InquiryStatus.New;
  return (
    <button
      type='button'
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...styles.row,
        ...(hovered && !active ? styles.rowHover : {}),
        ...(active ? styles.rowActive : {}),
      }}
    >
      <Avatar name={inquiry.name} size={38} unread={unread} />
      <span style={styles.rowBody}>
        <span style={styles.rowTop}>
          <span
            style={{
              ...styles.rowName,
              fontWeight: unread ? 700 : 500,
              color: unread || active ? theme.colors.white : theme.colors.lightBlue,
            }}
          >
            {inquiry.name}
          </span>
          <span style={{ ...styles.rowDate, color: unread ? theme.colors.blue04 : theme.colors.dark05 }}>
            {shortDate(inquiry.createdAt)}
          </span>
        </span>
        <span style={styles.rowMeta}>
          <span>{TOPIC_LABELS[inquiry.topic]}</span>
          <span style={styles.rowLocale}>{inquiry.locale.toUpperCase()}</span>
          {inquiry.status === InquiryStatus.Answered ? (
            <FiCornerUpLeft size={12} color={theme.colors.lightGreen} title='Answered' />
          ) : null}
        </span>
        <span style={{ ...styles.rowExcerpt, color: unread ? theme.colors.white : theme.colors.dark05 }}>
          {inquiry.message}
        </span>
      </span>
    </button>
  );
};

const errorMessage = (e: unknown, fallback: string) => {
  const raw = (e as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
  return (Array.isArray(raw) ? raw.join(', ') : raw) || fallback;
};

export const InquiriesInbox = () => {
  const styles = useStyles();
  const theme = useTheme();
  const { inquiriesApi } = useApi();
  const can = useCan();
  const canManage = can('inquiry.manage');
  const toast = useToast();

  const [params, setParams] = useUrlParams(['box', 'id', 'panel'] as const);
  const box: Box = params.box === 'archived' || params.box === 'spam' ? params.box : 'inbox';
  const selectedId = params.id;

  const [topic, setTopic] = useState<InquiryTopic>();
  const [search, setSearch] = useState('');
  const [term, setTerm] = useState('');
  const [items, setItems] = useState<InquiryResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [summary, setSummary] = useState<InquirySummaryResponse>();
  const [detail, setDetail] = useState<InquiryResponse>();
  const [detailLoading, setDetailLoading] = useState(false);
  const requestRef = useRef(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setTerm(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const loadSummary = useCallback(() => {
    if (!inquiriesApi) return;
    inquiriesApi
      .inquiryControllerSummary()
      .then((res) => setSummary(res.data))
      .catch((e) => console.error('Error loading inquiry summary:', e));
  }, [inquiriesApi]);

  const fetchPage = useCallback(
    (skip: number) =>
      inquiriesApi
        ? inquiriesApi
            .inquiryControllerList({ take: PAGE, skip, status: BOX_STATUS[box], topic, search: term || undefined })
            .then((res) => res.data)
        : Promise.resolve({ total: 0, inquiries: [] as InquiryResponse[] }),
    [inquiriesApi, box, topic, term],
  );

  useEffect(() => {
    if (!inquiriesApi) return;
    const request = ++requestRef.current;
    setLoading(true);
    fetchPage(0)
      .then((data) => {
        if (request !== requestRef.current) return;
        setItems(data.inquiries);
        setTotal(data.total);
      })
      .catch((e) => {
        console.error('Error loading inquiries:', e);
        toast(errorMessage(e, 'Could not load the messages.'), 'error');
      })
      .finally(() => request === requestRef.current && setLoading(false));
  }, [inquiriesApi, fetchPage]);

  useEffect(loadSummary, [loadSummary]);

  const settingsModal = useModal(
    'contact-form-settings',
    ContactFormSettingsModal,
    { title: 'Contact form', type: 'side' },
    {
      handleClose: async () => {
        setParams({ panel: null });
        settingsModal.hide();
      },
    },
  );
  const settingsOpenRef = useRef(false);

  const openSettings = () => {
    settingsOpenRef.current = true;
    setParams({ panel: 'form' });
    settingsModal.show({
      handleClose: async () => {
        settingsOpenRef.current = false;
        setParams({ panel: null });
        settingsModal.hide();
      },
    });
  };

  // Opening from a link: ?panel=form shows the form settings.
  useEffect(() => {
    if (params.panel === 'form' && !settingsOpenRef.current) openSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.panel]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const data = await fetchPage(items.length);
      setItems((prev) => [...prev, ...data.inquiries.filter((i) => !prev.some((p) => p.id === i.id))]);
      setTotal(data.total);
    } catch (e) {
      console.error('Error loading more inquiries:', e);
    } finally {
      setLoadingMore(false);
    }
  };

  const afterChange = () => {
    loadSummary();
    notifyInquiriesChanged();
  };

  /** Applies a changed inquiry to the list: replaced in place, or dropped if it left this box. */
  const applyToList = (next: InquiryResponse) => {
    if (inBox(box, next.status)) {
      setItems((prev) => prev.map((i) => (i.id === next.id ? next : i)));
      return;
    }
    setItems((prev) => prev.filter((i) => i.id !== next.id));
    setTotal((t) => Math.max(0, t - 1));
  };

  /** The message after this one in the list, to open once this one leaves the box. */
  const neighbourOf = (id: string) => {
    const index = items.findIndex((i) => i.id === id);
    return items[index + 1]?.id ?? items[index - 1]?.id;
  };

  // Opening a message loads it fresh and, if it was new, marks it read.
  useEffect(() => {
    if (!inquiriesApi || !selectedId) {
      setDetail(undefined);
      return;
    }
    let active = true;
    setDetailLoading(true);
    (async () => {
      try {
        let { data } = await inquiriesApi.inquiryControllerGet({ id: selectedId });
        if (data.status === InquiryStatus.New && canManage) {
          ({ data } = await inquiriesApi.inquiryControllerPatch({
            id: selectedId,
            patchInquiryDto: { status: InquiryStatus.Read },
          }));
          if (active) {
            setItems((prev) => prev.map((i) => (i.id === data.id ? data : i)));
            afterChange();
          }
        }
        if (active) setDetail(data);
      } catch (e) {
        console.error('Error loading inquiry:', e);
        if (active) setDetail(undefined);
      } finally {
        if (active) setDetailLoading(false);
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inquiriesApi, selectedId, canManage]);

  const setStatus = async (inquiry: InquiryResponse, status: InquiryStatus, then: 'stay' | 'close' | 'next') => {
    if (!inquiriesApi) return;
    const next = then === 'next' ? neighbourOf(inquiry.id) : undefined;
    try {
      const { data } = await inquiriesApi.inquiryControllerPatch({ id: inquiry.id, patchInquiryDto: { status } });
      applyToList(data);
      if (then === 'stay') setDetail(data);
      else setParams({ id: next ?? null });
      afterChange();
    } catch (e) {
      toast(errorMessage(e, 'Could not update the message.'), 'error');
    }
  };

  const saveNote = async (inquiry: InquiryResponse, internalNote: string) => {
    if (!inquiriesApi) return;
    try {
      const { data } = await inquiriesApi.inquiryControllerPatch({
        id: inquiry.id,
        patchInquiryDto: { internalNote: internalNote.trim() || null },
      });
      applyToList(data);
      setDetail(data);
      toast('Note saved', 'success');
    } catch (e) {
      toast(errorMessage(e, 'Could not save the note.'), 'error');
    }
  };

  const remove = async (inquiry: InquiryResponse) => {
    if (!inquiriesApi) return;
    const next = neighbourOf(inquiry.id);
    try {
      await inquiriesApi.inquiryControllerRemove({ id: inquiry.id });
      setItems((prev) => prev.filter((i) => i.id !== inquiry.id));
      setTotal((t) => Math.max(0, t - 1));
      setParams({ id: next ?? null });
      afterChange();
    } catch (e) {
      toast(errorMessage(e, 'Could not delete the message.'), 'error');
    }
  };

  const reply = (inquiry: InquiryResponse) => {
    // The answer goes from the owner's own mailbox; the panel only records it.
    window.location.href = inquiry.replyMailto;
    if (canManage && inquiry.status !== InquiryStatus.Answered) setStatus(inquiry, InquiryStatus.Answered, 'stay');
  };

  const metaParts = summary
    ? [`${summary.new} new`, `${summary.open} read`, summary.spam ? `${summary.spam} spam` : null].filter(Boolean)
    : [];

  return (
    <div style={styles.page}>
      <PageHeader
        title='Inbox'
        meta={metaParts.join(' · ') || undefined}
        actions={
          <Button label='Contact form' variant='secondary' icon={<FiSettings size={15} />} onClick={openSettings} />
        }
      />

      <div style={styles.toolbar}>
        <div style={styles.toolbarRow}>
          <SegmentedTabs
            layoutId='inquiry-box'
            items={[
              { value: 'inbox', label: summary?.new ? `Inbox · ${summary.new}` : 'Inbox' },
              { value: 'archived', label: 'Archived' },
              { value: 'spam', label: summary?.spam ? `Spam · ${summary.spam}` : 'Spam' },
            ]}
            selected={box}
            handleSelect={(value) => setParams({ box: value === 'inbox' ? null : value, id: null })}
          />
          <label style={styles.searchBox}>
            <FiSearch size={15} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Search name, email or message…'
              style={styles.searchInput}
            />
            {search ? (
              <button type='button' style={styles.clearSearch} onClick={() => setSearch('')} aria-label='Clear search'>
                <FiX size={14} />
              </button>
            ) : null}
          </label>
        </div>
        <div style={styles.chips}>
          <button
            type='button'
            style={{ ...styles.chip, ...(!topic ? styles.chipOn : {}) }}
            onClick={() => setTopic(undefined)}
          >
            All topics
          </button>
          {ALL_TOPICS.map((t) => (
            <button
              key={t}
              type='button'
              style={{ ...styles.chip, ...(topic === t ? styles.chipOn : {}) }}
              onClick={() => setTopic(topic === t ? undefined : t)}
            >
              {TOPIC_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.body}>
        <div style={styles.listColumn}>
          {loading ? (
            <div style={styles.centered}>
              <Loader />
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={box === 'spam' ? <FiSlash size={24} color={theme.colors.blue04} /> : undefined}
              title={
                term || topic
                  ? 'Nothing matches'
                  : box === 'inbox'
                    ? 'No messages'
                    : box === 'archived'
                      ? 'Nothing archived'
                      : 'No spam'
              }
            />
          ) : (
            <>
              {groupByDay(items).map((group) => (
                <div key={group.label} style={styles.group}>
                  <span style={styles.groupLabel}>{group.label}</span>
                  {group.items.map((inquiry) => (
                    <InquiryRow
                      key={inquiry.id}
                      inquiry={inquiry}
                      active={inquiry.id === selectedId}
                      onOpen={() => setParams({ id: inquiry.id })}
                    />
                  ))}
                </div>
              ))}
              {items.length < total ? (
                <Button label='Load more' variant='secondary' onClick={loadMore} loading={loadingMore} />
              ) : null}
            </>
          )}
        </div>

        <div style={styles.detailColumn}>
          {detail && detail.id === selectedId ? (
            <InquiryDetail
              key={detail.id}
              inquiry={detail}
              canManage={canManage}
              onReply={() => reply(detail)}
              onStatus={(status, then) => setStatus(detail, status, then)}
              onSaveNote={(note) => saveNote(detail, note)}
              onDelete={() => remove(detail)}
            />
          ) : selectedId && detailLoading ? (
            <div style={styles.centered}>
              <Loader />
            </div>
          ) : (
            <EmptyState icon={<FiMail size={24} color={theme.colors.blue04} />} title='Select a message' />
          )}
        </div>
      </div>
    </div>
  );
};

type InquiryDetailProps = {
  inquiry: InquiryResponse;
  canManage: boolean;
  onReply: () => void;
  onStatus: (status: InquiryStatus, then: 'stay' | 'close' | 'next') => Promise<void>;
  onSaveNote: (note: string) => Promise<void>;
  onDelete: () => Promise<void>;
};

const InquiryDetail = ({ inquiry, canManage, onReply, onStatus, onSaveNote, onDelete }: InquiryDetailProps) => {
  const styles = useStyles();
  const theme = useTheme();
  const { control, watch, reset } = useForm<{ note: string }>({
    defaultValues: { note: inquiry.internalNote ?? '' },
  });
  const note = watch('note') ?? '';
  // Remounts the field on reset, so its floating label follows the new value.
  const [noteKey, setNoteKey] = useState(0);
  const resetNote = () => {
    reset({ note: inquiry.internalNote ?? '' });
    setNoteKey((k) => k + 1);
  };
  const [savingNote, setSavingNote] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(resetNote, [inquiry.internalNote]); // eslint-disable-line react-hooks/exhaustive-deps

  // A second click deletes; the armed state lapses if it does not come.
  useEffect(() => {
    if (!confirmDelete) return;
    const timer = window.setTimeout(() => setConfirmDelete(false), 4000);
    return () => window.clearTimeout(timer);
  }, [confirmDelete]);

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    try {
      await action();
    } finally {
      setBusy(false);
    }
  };

  const isSpam = inquiry.status === InquiryStatus.Spam;
  const isArchived = inquiry.status === InquiryStatus.Archived;
  const noteDirty = note.trim() !== (inquiry.internalNote ?? '').trim();
  const imageSrc = imgUrl(inquiry.image?.thumbUrl ?? inquiry.image?.coverUrl);

  const stamp = (iso: string) => format(new Date(iso), 'd MMM yyyy, HH:mm');

  return (
    <div style={styles.detail}>
      <div style={styles.detailHeader}>
        <Avatar name={inquiry.name} size={52} />
        <div style={styles.detailTitleBlock}>
          <div style={styles.nameRow}>
            <span style={styles.detailName}>{inquiry.name}</span>
            <StatusPill status={inquiry.status} />
          </div>
          <div style={styles.contactLine}>
            <a href={`mailto:${inquiry.email}`} style={styles.contactLink}>
              <FiMail size={13} /> {inquiry.email}
            </a>
            {inquiry.phone ? (
              <a href={`tel:${inquiry.phone}`} style={styles.contactLink}>
                <FiPhone size={13} /> {inquiry.phone}
              </a>
            ) : null}
          </div>
        </div>
        <div style={styles.detailSide}>
          <span style={styles.detailDate}>{stamp(inquiry.createdAt)}</span>
          <span style={styles.detailAgo}>{formatDistanceToNow(new Date(inquiry.createdAt), { addSuffix: true })}</span>
        </div>
      </div>

      <div style={styles.tags}>
        <span style={styles.topicTag}>{TOPIC_LABELS[inquiry.topic]}</span>
        <span style={styles.localeTag} title='Form language'>
          {inquiry.locale.toUpperCase()}
        </span>
      </div>

      {isSpam && inquiry.internalNote ? (
        <div style={styles.spamBanner}>
          <FiSlash size={14} />
          <span>Flagged as spam: {inquiry.internalNote}</span>
        </div>
      ) : null}

      {canManage ? (
        <div style={styles.actions}>
          {isSpam ? (
            <Button
              label='Not spam'
              icon={<FiInbox size={15} />}
              onClick={() => run(() => onStatus(InquiryStatus.New, 'next'))}
              disabled={busy}
            />
          ) : (
            <>
              <Button label='Reply' icon={<FiCornerUpLeft size={15} />} onClick={onReply} disabled={busy} />
              <Button
                label='Mark unread'
                variant='secondary'
                icon={<FiMail size={15} />}
                onClick={() => run(() => onStatus(InquiryStatus.New, 'close'))}
                disabled={busy}
              />
              {isArchived ? (
                <Button
                  label='Move to inbox'
                  variant='secondary'
                  icon={<FiInbox size={15} />}
                  onClick={() => run(() => onStatus(InquiryStatus.Read, 'next'))}
                  disabled={busy}
                />
              ) : (
                <Button
                  label='Archive'
                  variant='secondary'
                  icon={<FiArchive size={15} />}
                  onClick={() => run(() => onStatus(InquiryStatus.Archived, 'next'))}
                  disabled={busy}
                />
              )}
              <Button
                label='Spam'
                variant='secondary'
                icon={<FiSlash size={15} />}
                onClick={() => run(() => onStatus(InquiryStatus.Spam, 'next'))}
                disabled={busy}
              />
            </>
          )}
          <Button
            label={confirmDelete ? 'Click again to delete' : 'Delete'}
            variant={confirmDelete ? 'danger' : 'secondary'}
            icon={<FiTrash2 size={15} />}
            onClick={() => (confirmDelete ? run(onDelete) : setConfirmDelete(true))}
            disabled={busy}
            style={styles.deleteButton}
          />
        </div>
      ) : inquiry.status !== InquiryStatus.Spam ? (
        <div style={styles.actions}>
          <Button label='Reply' icon={<FiCornerUpLeft size={15} />} onClick={onReply} />
        </div>
      ) : null}

      {inquiry.gallery || inquiry.image ? (
        <div style={styles.context}>
          {imageSrc ? <img src={imageSrc} alt='' style={styles.contextImage} /> : null}
          <div style={styles.contextText}>
            <span style={styles.contextLabel}>Sent from</span>
            {inquiry.gallery ? (
              <Link to={`/${MainNavigationRoute.GALLERIES}/${inquiry.gallery.id}`} style={styles.contextLink}>
                {inquiry.gallery.title}
              </Link>
            ) : (
              <span style={styles.contextValue}>A photo</span>
            )}
          </div>
        </div>
      ) : null}

      <div style={styles.messageCard}>
        <p style={styles.message}>{inquiry.message}</p>
      </div>

      {canManage && !isSpam ? (
        <div style={styles.noteBlock}>
          <TextArea
            key={noteKey}
            control={control}
            name='note'
            label='Internal note'
            description='Only visible here'
            rows={3}
            style={styles.noteField}
          />
          {noteDirty ? (
            <div style={styles.noteActions}>
              <Button label='Cancel' variant='secondary' onClick={resetNote} />
              <Button
                label='Save note'
                loading={savingNote}
                onClick={async () => {
                  setSavingNote(true);
                  try {
                    await onSaveNote(note);
                  } finally {
                    setSavingNote(false);
                  }
                }}
              />
            </div>
          ) : null}
        </div>
      ) : !canManage && inquiry.internalNote && !isSpam ? (
        <div style={styles.noteBlock}>
          <span style={styles.noteLabel}>Internal note</span>
          <span style={{ color: theme.colors.white, whiteSpace: 'pre-wrap' }}>{inquiry.internalNote}</span>
        </div>
      ) : null}

      <div style={styles.timeline}>
        <span style={styles.timelineItem}>Received {stamp(inquiry.createdAt)}</span>
        {inquiry.readAt ? <span style={styles.timelineItem}>Read {stamp(inquiry.readAt)}</span> : null}
        {inquiry.answeredAt ? <span style={styles.timelineItem}>Answered {stamp(inquiry.answeredAt)}</span> : null}
        <span style={styles.timelineItem}>
          Privacy notice {inquiry.privacyNoticeLocale.toUpperCase()} v{inquiry.privacyNoticeVersion} acknowledged{' '}
          {stamp(inquiry.noticeAcknowledgedAt)}
        </span>
      </div>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  page: { flex: 1, minHeight: 0, height: '100%', gap: t.spacing.m },
  toolbar: { gap: t.spacing.s, flexShrink: 0 },
  toolbarRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: t.spacing.m },
  searchBox: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    flex: 1,
    minWidth: 220,
    maxWidth: 420,
    marginLeft: 'auto',
    height: 44,
    padding: `0 ${t.spacing.m}px`,
    boxSizing: 'border-box',
    borderRadius: t.borderRadius.default,
    color: t.colors.dark05,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.5),
    cursor: 'text',
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    height: '100%',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    color: t.colors.white,
    fontSize: 14,
    padding: 0,
  },
  clearSearch: {
    display: 'flex',
    border: 'none',
    background: 'transparent',
    color: t.colors.dark05,
    cursor: 'pointer',
    padding: 2,
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
  body: { flex: 1, minHeight: 0, flexDirection: 'row', gap: t.spacing.m },
  listColumn: {
    width: 400,
    flexShrink: 0,
    minHeight: 0,
    overflowY: 'auto',
    gap: t.spacing.s,
    padding: t.spacing.s,
    boxSizing: 'border-box',
    borderRadius: t.borderRadius.large,
    backgroundColor: t.colors.gray03 + t.colorOpacity(0.7),
  },
  detailColumn: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    overflowY: 'auto',
    borderRadius: t.borderRadius.large,
    backgroundColor: t.colors.gray03 + t.colorOpacity(0.7),
  },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: t.spacing.xl },
  group: { gap: 2, flexShrink: 0 },
  groupLabel: {
    padding: '6px 10px 4px',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: t.colors.dark05,
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: '10px 10px',
    border: 'none',
    borderRadius: t.borderRadius.default,
    textAlign: 'left',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    transition: 'background-color 0.12s ease',
    flexShrink: 0,
  },
  rowHover: { backgroundColor: t.colors.white + t.colorOpacity(0.04) },
  rowActive: { backgroundColor: t.colors.blue + t.colorOpacity(0.16) },
  rowBody: { display: 'flex', flexDirection: 'column', gap: 3, flex: 1, minWidth: 0 },
  rowTop: { display: 'flex', flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  rowName: {
    flex: 1,
    minWidth: 0,
    fontSize: 14,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  rowDate: { fontSize: 12, flexShrink: 0 },
  rowMeta: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    fontSize: 12,
    fontWeight: 600,
    color: t.colors.blue04,
  },
  rowLocale: { fontSize: 11, fontWeight: 700, letterSpacing: 0.5, color: t.colors.dark05 },
  rowExcerpt: {
    fontSize: 13,
    lineHeight: 1.4,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  avatar: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    borderRadius: '50%',
    fontWeight: 700,
    letterSpacing: 0.5,
  },
  avatarDot: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 11,
    height: 11,
    borderRadius: '50%',
    boxSizing: 'border-box',
    border: `2px solid ${t.colors.gray03}`,
    backgroundColor: t.colors.blue,
  },
  pill: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    padding: '3px 9px',
    borderRadius: 999,
  },
  detail: { gap: t.spacing.m, padding: t.spacing.l, maxWidth: 880 },
  detailHeader: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.m },
  detailTitleBlock: { gap: 4, flex: 1, minWidth: 0 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.s, flexWrap: 'wrap' },
  detailName: { fontSize: 22, fontWeight: 700, color: t.colors.white },
  contactLine: { flexDirection: 'row', flexWrap: 'wrap', columnGap: t.spacing.m, rowGap: 2 },
  contactLink: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    fontSize: 14,
    color: t.colors.blue04,
    textDecoration: 'none',
  },
  detailSide: { alignItems: 'flex-end', gap: 2, flexShrink: 0 },
  detailDate: { fontSize: 13, color: t.colors.lightBlue },
  detailAgo: { fontSize: 12, color: t.colors.dark05 },
  tags: { flexDirection: 'row', gap: 6, marginTop: -4 },
  topicTag: {
    fontSize: 12,
    fontWeight: 600,
    padding: '4px 10px',
    borderRadius: 999,
    color: t.colors.blue04,
    backgroundColor: t.colors.blue04 + t.colorOpacity(0.14),
  },
  localeTag: {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 0.5,
    padding: '4px 10px',
    borderRadius: 999,
    color: t.colors.dark05,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
  },
  spamBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    padding: '10px 12px',
    borderRadius: t.borderRadius.default,
    fontSize: 13,
    color: t.colors.red,
    backgroundColor: t.colors.red + t.colorOpacity(0.12),
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: t.spacing.s,
    paddingTop: t.spacing.m,
    paddingBottom: t.spacing.m,
    borderTop: `1px solid ${t.colors.white + t.colorOpacity(0.06)}`,
    borderBottom: `1px solid ${t.colors.white + t.colorOpacity(0.06)}`,
  },
  deleteButton: { marginLeft: 'auto' },
  context: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.m,
    padding: t.spacing.s,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.4),
  },
  contextImage: { width: 72, height: 72, objectFit: 'cover', borderRadius: t.borderRadius.default, flexShrink: 0 },
  contextText: { gap: 2, minWidth: 0 },
  contextLabel: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: t.colors.dark05,
  },
  contextLink: { fontSize: 14, fontWeight: 600, color: t.colors.blue04, textDecoration: 'none' },
  contextValue: { fontSize: 14, color: t.colors.white },
  messageCard: {
    padding: `${t.spacing.m}px ${t.spacing.l}px`,
    borderRadius: t.borderRadius.large,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.35),
    border: `1px solid ${t.colors.white + t.colorOpacity(0.06)}`,
  },
  message: { margin: 0, fontSize: 15, lineHeight: 1.65, color: t.colors.white, whiteSpace: 'pre-wrap' },
  noteBlock: { gap: t.spacing.s },
  noteLabel: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: t.colors.dark05,
  },
  noteField: { marginBottom: 0 },
  noteActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: t.spacing.s },
  timeline: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: t.spacing.m,
    rowGap: 2,
    paddingTop: t.spacing.s,
    fontSize: 11,
    color: t.colors.dark05,
  },
  timelineItem: { whiteSpace: 'nowrap' },
}));
