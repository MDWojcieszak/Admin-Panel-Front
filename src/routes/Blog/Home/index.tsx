import { useEffect, useState } from 'react';
import { MdArrowDownward, MdArrowUpward, MdClose, MdPushPin } from 'react-icons/md';
import { Loader } from '~/components/Loader';
import { Scrollbar } from '~/components/Scrollbar';
import { useCan } from '~/hooks/usePermissions';
import { PostPicker } from '~/routes/Blog/Home/components/PostPicker';
import { useHomeCuration } from '~/routes/Blog/Home/hooks/useHomeCuration';
import { mkUseStyles, useTheme } from '~/utils/theme';

export const BlogHome = () => {
  const styles = useStyles();
  const theme = useTheme();
  const canManage = useCan()('blog.home.manage');
  const { config, pins, loading, saveConfig, savePins } = useHomeCuration();

  const [count, setCount] = useState('');
  useEffect(() => {
    if (config) setCount(String(config.postCount));
  }, [config?.postCount]); // eslint-disable-line react-hooks/exhaustive-deps

  const commitCount = () => {
    const n = Math.max(1, Math.min(100, Math.round(Number(count)) || 1));
    setCount(String(n));
    if (config && n !== config.postCount) saveConfig(n);
  };

  const addPin = (postId: string, slug: string) => {
    if (pins.some((p) => p.postId === postId)) return;
    savePins([...pins, { postId, slug, position: pins.length + 1 }]);
  };
  const removePin = (postId: string) => savePins(pins.filter((p) => p.postId !== postId));
  const movePin = (idx: number, dir: -1 | 1) => {
    const swap = idx + dir;
    if (swap < 0 || swap >= pins.length) return;
    const next = [...pins];
    [next[idx], next[swap]] = [next[swap], next[idx]];
    savePins(next);
  };

  return (
    <div style={styles.container}>
      <div style={styles.toolbar}>
        <h2 style={styles.title}>Home page</h2>
      </div>

      {loading && !config ? (
        <div style={styles.centered}>
          <Loader />
        </div>
      ) : (
        <div style={styles.bodyWrap}>
          <Scrollbar style={styles.scroll}>
            <div style={styles.body}>
              <p style={styles.intro}>
                The home page shows a fixed list of posts: pinned posts hold their slot, the remaining slots fill with the
                newest published posts.
              </p>

              {/* Post count */}
              <section style={styles.card}>
                <span style={styles.cardTitle}>Posts on the home page</span>
                <div style={styles.countRow}>
                  <input
                    style={styles.countInput}
                    type='number'
                    min={1}
                    max={100}
                    value={count}
                    disabled={!canManage}
                    onChange={(e) => setCount(e.target.value)}
                    onBlur={commitCount}
                    onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                  />
                  <span style={styles.hint}>cards total (1–100), including the pinned ones</span>
                </div>
              </section>

              {/* Pinned posts */}
              <section style={styles.card}>
                <span style={styles.cardTitle}>Pinned posts</span>
                {pins.length ? (
                  <div style={styles.pinList}>
                    {pins.map((p, i) => (
                      <div key={p.postId} style={styles.pinRow}>
                        <span style={styles.slot}>{p.position}</span>
                        <MdPushPin size={15} color={theme.colors.blue04} />
                        <span style={styles.slug}>{p.slug}</span>
                        {canManage ? (
                          <div style={styles.pinActions}>
                            <button
                              style={styles.iconBtn}
                              title='Move up'
                              disabled={i === 0}
                              onClick={() => movePin(i, -1)}
                            >
                              <MdArrowUpward size={16} />
                            </button>
                            <button
                              style={styles.iconBtn}
                              title='Move down'
                              disabled={i === pins.length - 1}
                              onClick={() => movePin(i, 1)}
                            >
                              <MdArrowDownward size={16} />
                            </button>
                            <button style={styles.iconBtn} title='Unpin' onClick={() => removePin(p.postId)}>
                              <MdClose size={16} color={theme.colors.red} />
                            </button>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span style={styles.muted}>No pinned posts — the home page shows the newest posts only.</span>
                )}

                {canManage ? (
                  <div style={styles.picker}>
                    <PostPicker excludeIds={pins.map((p) => p.postId)} onPick={addPin} />
                  </div>
                ) : null}
              </section>
            </div>
          </Scrollbar>
        </div>
      )}
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: { height: '100%', minHeight: 0, gap: t.spacing.m },
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.spacing.m },
  title: { fontSize: 22, fontWeight: 700 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  bodyWrap: { flex: 1, minHeight: 0, position: 'relative' },
  scroll: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  body: { gap: t.spacing.l, paddingRight: t.spacing.m, maxWidth: 640 },
  intro: { fontSize: 13, color: t.colors.dark05, lineHeight: 1.5, margin: 0 },
  card: {
    gap: t.spacing.s,
    padding: t.spacing.m,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray05 + t.colorOpacity(0.5),
    border: `1px solid ${t.colors.white + t.colorOpacity(0.06)}`,
  },
  cardTitle: { fontSize: 12, fontWeight: 700, color: t.colors.blue04, textTransform: 'uppercase', letterSpacing: 0.5 },
  countRow: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.m },
  countInput: {
    width: 90,
    height: 40,
    boxSizing: 'border-box',
    padding: `0 ${t.spacing.m}px`,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray03,
    color: t.colors.white,
    border: 0,
    outline: 'none',
    fontSize: 16,
    fontWeight: 700,
  },
  hint: { fontSize: 12, color: t.colors.dark05 },
  pinList: { gap: t.spacing.xs },
  pinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    height: 40,
    padding: `0 ${t.spacing.s}px`,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray03,
  },
  slot: {
    width: 22,
    height: 22,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.borderRadius.small,
    backgroundColor: t.colors.blue + t.colorOpacity(0.25),
    color: t.colors.white,
    fontSize: 12,
    fontWeight: 700,
    flexShrink: 0,
  },
  slug: { flex: 1, minWidth: 0, fontSize: 13, fontFamily: 'monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  pinActions: { flexDirection: 'row', gap: 2, flexShrink: 0 },
  iconBtn: {
    width: 28,
    height: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.borderRadius.small,
    border: 0,
    background: 'transparent',
    color: t.colors.white,
    cursor: 'pointer',
  },
  picker: { marginTop: t.spacing.xs },
  muted: { fontSize: 13, color: t.colors.dark05 },
}));
