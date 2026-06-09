import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { BsHandThumbsDown, BsHandThumbsUp } from 'react-icons/bs';
import { MdFavorite, MdPeople, MdVisibility } from 'react-icons/md';
import { BlogFeedbackRating, InsightsResponse } from '~/api/api';
import { Loader } from '~/components/Loader';
import { Scrollbar } from '~/components/Scrollbar';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useApi } from '~/hooks/useApi';
import { mkUseStyles, useTheme } from '~/utils/theme';

type PostInsightsModalProps = {
  postId?: string;
  slug?: string;
} & Partial<InternalModalProps>;

export const PostInsightsModal = (p: PostInsightsModalProps) => {
  const styles = useStyles();
  const theme = useTheme();
  const { blogInteractionsApi } = useApi();
  const [data, setData] = useState<InsightsResponse>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!blogInteractionsApi || !p.postId) return;
    let active = true;
    setLoading(true);
    blogInteractionsApi
      .interactionControllerInsights({ postId: p.postId, recentFeedbackLimit: 12 })
      .then((r) => active && setData(r.data))
      .catch((e) => console.error('Error loading insights:', e))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [blogInteractionsApi, p.postId]);

  const stats = data
    ? [
        { label: 'Views', value: data.viewCount, icon: <MdVisibility size={18} />, color: theme.colors.blue },
        { label: 'Unique', value: data.uniqueViewerCount, icon: <MdPeople size={18} />, color: theme.colors.blue04 },
        { label: 'Likes', value: data.likeCount, icon: <MdFavorite size={16} />, color: theme.colors.red },
        { label: 'Helpful', value: data.helpfulCount, icon: <BsHandThumbsUp size={15} />, color: theme.colors.lightGreen },
        { label: 'Not helpful', value: data.notHelpfulCount, icon: <BsHandThumbsDown size={15} />, color: theme.colors.yellow },
      ]
    : [];

  return (
    <div style={styles.container}>
      {p.slug ? <span style={styles.slug}>{p.slug}</span> : null}

      {loading && !data ? (
        <div style={styles.centered}>
          <Loader />
        </div>
      ) : !data ? (
        <span style={styles.muted}>Could not load insights.</span>
      ) : (
        <>
          <div style={styles.stats}>
            {stats.map((s) => (
              <div key={s.label} style={styles.stat}>
                <span style={{ ...styles.statIcon, color: s.color }}>{s.icon}</span>
                <span style={styles.statValue}>{s.value}</span>
                <span style={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>

          <span style={styles.sectionTitle}>Recent feedback</span>
          <div style={styles.feedbackWrap}>
            <Scrollbar style={styles.scroll}>
              {data.recentFeedback.length ? (
                <div style={styles.feedbackList}>
                  {data.recentFeedback.map((f) => (
                    <div key={f.id} style={styles.feedback}>
                      <div style={styles.feedbackHead}>
                        {f.rating === BlogFeedbackRating.Helpful ? (
                          <BsHandThumbsUp size={13} color={theme.colors.lightGreen} />
                        ) : (
                          <BsHandThumbsDown size={13} color={theme.colors.yellow} />
                        )}
                        <span style={styles.feedbackTime}>{format(new Date(f.createdAt), 'd MMM y · HH:mm')}</span>
                      </div>
                      {f.comment ? <span style={styles.feedbackComment}>{f.comment}</span> : null}
                    </div>
                  ))}
                </div>
              ) : (
                <span style={styles.muted}>No feedback yet.</span>
              )}
            </Scrollbar>
          </div>
        </>
      )}
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    gap: t.spacing.m,
    width: 480,
  },
  slug: {
    fontSize: 13,
    color: t.colors.dark05,
    fontFamily: 'monospace',
  },
  centered: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 30,
  },
  muted: {
    color: t.colors.dark05,
    fontSize: 13,
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: t.spacing.s,
  },
  stat: {
    flex: 1,
    minWidth: 80,
    alignItems: 'center',
    gap: 2,
    padding: t.spacing.m,
    borderRadius: t.borderRadius.large,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.6),
    border: `1px solid ${t.colors.white + t.colorOpacity(0.04)}`,
  },
  statIcon: {
    marginBottom: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 800,
  },
  statLabel: {
    fontSize: 11,
    color: t.colors.dark05,
  },
  sectionTitle: {
    fontWeight: 700,
    fontSize: 15,
  },
  feedbackWrap: {
    height: 220,
    position: 'relative',
  },
  scroll: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  feedbackList: {
    gap: t.spacing.s,
    paddingRight: t.spacing.s,
  },
  feedback: {
    gap: 4,
    padding: t.spacing.s,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.4),
  },
  feedbackHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
  },
  feedbackTime: {
    fontSize: 11,
    color: t.colors.dark05,
  },
  feedbackComment: {
    fontSize: 13,
    whiteSpace: 'pre-wrap',
  },
}));
