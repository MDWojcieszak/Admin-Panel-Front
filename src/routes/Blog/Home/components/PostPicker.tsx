import { useEffect, useState } from 'react';
import { MdSearch } from 'react-icons/md';
import { PostResponse } from '~/api/api';
import { useApi } from '~/hooks/useApi';
import { mkUseStyles, useTheme } from '~/utils/theme';

type PostPickerProps = {
  excludeIds?: string[];
  onPick: (postId: string, slug: string) => void;
};

export const PostPicker = ({ excludeIds = [], onPick }: PostPickerProps) => {
  const styles = useStyles();
  const theme = useTheme();
  const { blogPostsApi } = useApi();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PostResponse[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!blogPostsApi || !query.trim()) {
      setResults([]);
      return;
    }
    const handle = setTimeout(async () => {
      try {
        const { data } = await blogPostsApi.postControllerList({ search: query.trim(), take: 8 });
        setResults(data.posts.filter((p) => !excludeIds.includes(p.id)));
      } catch (e) {
        console.error('Error searching posts:', e);
      }
    }, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, blogPostsApi]);

  return (
    <div style={styles.wrap}>
      <div style={styles.searchBox}>
        <MdSearch size={16} color={theme.colors.dark05} />
        <input
          style={styles.input}
          value={query}
          placeholder='Search a post to feature…'
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
      </div>
      {open && results.length ? (
        <div style={styles.results}>
          {results.map((post) => (
            <button
              key={post.id}
              style={styles.result}
              onClick={() => {
                onPick(post.id, post.slug);
                setQuery('');
                setResults([]);
                setOpen(false);
              }}
            >
              {post.slug}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  wrap: { position: 'relative' },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    height: 36,
    paddingLeft: t.spacing.m,
    paddingRight: t.spacing.m,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
  },
  input: {
    flex: 1,
    minWidth: 0,
    height: '100%',
    border: 0,
    outline: 'none',
    background: 'transparent',
    color: t.colors.white,
    fontSize: 13,
  },
  results: {
    marginTop: t.spacing.xs,
    gap: 2,
    padding: t.spacing.xs,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray05,
    border: `1px solid ${t.colors.white + t.colorOpacity(0.08)}`,
    maxHeight: 200,
    overflowY: 'auto',
  },
  result: {
    padding: t.spacing.s,
    borderRadius: t.borderRadius.small,
    border: 0,
    background: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    color: t.colors.white,
    fontSize: 13,
    fontFamily: 'monospace',
  },
}));
