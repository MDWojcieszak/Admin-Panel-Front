import { useCallback, useEffect, useRef, useState } from 'react';
import { format, isThisYear, isToday } from 'date-fns';
import { Link } from 'react-router-dom';
import { FiArchive, FiCornerUpLeft, FiInbox, FiMail, FiPhone, FiSearch, FiSlash, FiTrash2, FiX } from 'react-icons/fi';
import { InquiryResponse, InquiryStatus, InquirySummaryResponse, InquiryTopic } from '~/api/api';
import { Button } from '~/components/Button';
import { EmptyState } from '~/components/EmptyState';
import { Loader } from '~/components/Loader';
import { PageHeader } from '~/components/PageHeader';
import { SegmentedTabs } from '~/components/SegmentedTabs';
import { useApi } from '~/hooks/useApi';
import { notifyInquiriesChanged } from '~/hooks/useInquiryUnread';
import { useCan } from '~/hooks/usePermissions';
import { useToast } from '~/hooks/useToast';
import { useUrlParams } from '~/hooks/useUrlParam';
import { MainNavigationRoute } from '~/navigation/types';
import { imgUrl } from '~/routes/Galleries/utils';
import { ALL_TOPICS, STATUS_LABELS, TOPIC_LABELS } from '~/routes/Inquiries/labels';
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

const PAGE = 30;

const shortDate = (iso: string) => {
  const date = new Date(iso);
  if (isToday(date)) return format(date, 'HH:mm');
  return format(date, isThisYear(date) ? 'd MMM' : 'd MMM yyyy');
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

  const [params, setParams] = useUrlParams(['box', 'id'] as const);
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
      .catch((e) => console.error('Error loading inquiries:', e))
      .finally(() => request === requestRef.current && setLoading(false));
  }, [inquiriesApi, fetchPage]);

  useEffect(loadSummary, [loadSummary]);

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
      <PageHeader title='Inbox' meta={metaParts.join(' · ') || undefined} />

      <div style={styles.toolbar}>
        <SegmentedTabs
          layoutId='inquiry-box'
          items={[
            { value: 'inbox', label: 'Inbox' },
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
              {items.map((inquiry) => {
                const active = inquiry.id === selectedId;
                const unread = inquiry.status === InquiryStatus.New;
                return (
                  <button
                    key={inquiry.id}
                    type='button'
                    onClick={() => setParams({ id: inquiry.id })}
                    style={{ ...styles.row, ...(active ? styles.rowActive : {}) }}
                  >
                    <div style={styles.rowTop}>
                      <span style={{ ...styles.dot, opacity: unread ? 1 : 0 }} />
                      <span style={{ ...styles.rowName, fontWeight: unread ? 700 : 500 }}>{inquiry.name}</span>
                      <span style={styles.rowDate}>{shortDate(inquiry.createdAt)}</span>
                    </div>
                    <div style={styles.rowMeta}>
                      <span>{TOPIC_LABELS[inquiry.topic]}</span>
                      {inquiry.status === InquiryStatus.Answered ? (
                        <span style={styles.answeredTag}>
                          <FiCornerUpLeft size={11} /> Answered
                        </span>
                      ) : null}
                    </div>
                    <span style={{ ...styles.rowExcerpt, color: unread ? theme.colors.white : theme.colors.dark05 }}>
                      {inquiry.message}
                    </span>
                  </button>
                );
              })}
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
  const [note, setNote] = useState(inquiry.internalNote ?? '');
  const [savingNote, setSavingNote] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => setNote(inquiry.internalNote ?? ''), [inquiry.internalNote]);

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

  return (
    <div style={styles.detail}>
      <div style={styles.detailHeader}>
        <div style={styles.detailTitleBlock}>
          <span style={styles.detailName}>{inquiry.name}</span>
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
          <span style={styles.detailDate}>{format(new Date(inquiry.createdAt), 'd MMM yyyy, HH:mm')}</span>
          <div style={styles.tags}>
            <span style={styles.topicTag}>{TOPIC_LABELS[inquiry.topic]}</span>
            <span style={styles.statusTag}>{STATUS_LABELS[inquiry.status]}</span>
          </div>
        </div>
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

      <p style={styles.message}>{inquiry.message}</p>

      {canManage && !isSpam ? (
        <div style={styles.noteBlock}>
          <span style={styles.noteLabel}>Internal note</span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            maxLength={2000}
            placeholder='Only visible here'
            style={styles.noteInput}
          />
          {noteDirty ? (
            <div style={styles.noteActions}>
              <Button label='Cancel' variant='secondary' onClick={() => setNote(inquiry.internalNote ?? '')} />
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

      <div style={styles.finePrint}>
        <span>
          Privacy notice v{inquiry.privacyNoticeVersion} acknowledged{' '}
          {format(new Date(inquiry.noticeAcknowledgedAt), 'd MMM yyyy, HH:mm')}
        </span>
        {inquiry.answeredAt ? <span>Answered {format(new Date(inquiry.answeredAt), 'd MMM yyyy, HH:mm')}</span> : null}
      </div>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  page: { flex: 1, minHeight: 0, height: '100%', gap: t.spacing.m },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: t.spacing.m,
    flexShrink: 0,
  },
  searchBox: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    flex: 1,
    minWidth: 220,
    maxWidth: 360,
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
    width: 380,
    flexShrink: 0,
    minHeight: 0,
    overflowY: 'auto',
    gap: 4,
    padding: t.spacing.xs,
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
  row: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    padding: '10px 12px',
    border: 'none',
    borderRadius: t.borderRadius.default,
    textAlign: 'left',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    transition: 'background-color 0.12s ease',
    flexShrink: 0,
  },
  rowActive: { backgroundColor: t.colors.blue + t.colorOpacity(0.16) },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0, backgroundColor: t.colors.blue },
  rowName: {
    flex: 1,
    minWidth: 0,
    fontSize: 14,
    color: t.colors.white,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  rowDate: { fontSize: 12, color: t.colors.dark05, flexShrink: 0 },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 16,
    fontSize: 12,
    fontWeight: 600,
    color: t.colors.blue04,
  },
  answeredTag: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    color: t.colors.lightGreen,
  },
  rowExcerpt: {
    paddingLeft: 16,
    fontSize: 13,
    lineHeight: 1.4,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  detail: { gap: t.spacing.m, padding: t.spacing.l },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: t.spacing.m,
    flexWrap: 'wrap',
  },
  detailTitleBlock: { gap: 6, minWidth: 0 },
  detailName: { fontSize: 20, fontWeight: 700, color: t.colors.white },
  contactLine: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.m },
  contactLink: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    fontSize: 14,
    color: t.colors.blue04,
    textDecoration: 'none',
  },
  detailSide: { alignItems: 'flex-end', gap: 6 },
  detailDate: { fontSize: 13, color: t.colors.dark05 },
  tags: { flexDirection: 'row', gap: 6 },
  topicTag: {
    fontSize: 12,
    fontWeight: 600,
    padding: '3px 10px',
    borderRadius: 999,
    color: t.colors.blue04,
    backgroundColor: t.colors.blue04 + t.colorOpacity(0.14),
  },
  statusTag: {
    fontSize: 12,
    fontWeight: 600,
    padding: '3px 10px',
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
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.s },
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
  message: { margin: 0, fontSize: 15, lineHeight: 1.6, color: t.colors.white, whiteSpace: 'pre-wrap' },
  noteBlock: { gap: t.spacing.s },
  noteLabel: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: t.colors.dark05,
  },
  noteInput: {
    resize: 'vertical',
    padding: t.spacing.m,
    fontSize: 14,
    fontFamily: 'inherit',
    color: t.colors.white,
    border: 'none',
    outline: 'none',
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.5),
  },
  noteActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: t.spacing.s },
  finePrint: { gap: 2, fontSize: 11, color: t.colors.dark05, paddingTop: t.spacing.s },
}));
