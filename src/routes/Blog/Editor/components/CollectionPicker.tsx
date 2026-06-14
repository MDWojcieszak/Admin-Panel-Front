import { useEffect, useState } from 'react';
import { MdSearch } from 'react-icons/md';
import { CollectionSummaryResponse } from '~/api/api';
import { useApi } from '~/hooks/useApi';
import { mkUseStyles, useTheme } from '~/utils/theme';

type CollectionPickerProps = {
  onPick: (collectionId: string) => void;
};

/** Search the admin collections and pick one to embed (by collectionId). */
export const CollectionPicker = ({ onPick }: CollectionPickerProps) => {
  const styles = useStyles();
  const theme = useTheme();
  const { blogCollectionsApi } = useApi();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CollectionSummaryResponse[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!blogCollectionsApi) return;
    const handle = setTimeout(async () => {
      try {
        const { data } = await blogCollectionsApi.collectionControllerList({ search: query.trim() || undefined, take: 8 });
        setResults(data.collections);
      } catch (e) {
        console.error('Error searching collections:', e);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [query, blogCollectionsApi]);

  return (
    <div style={styles.wrap}>
      <div style={styles.searchBox}>
        <MdSearch size={18} color={theme.colors.dark05} />
        <input
          style={styles.input}
          value={query}
          placeholder='Search a collection to embed…'
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
      </div>
      {open && results.length ? (
        <div style={styles.results}>
          {results.map((c) => (
            <button
              key={c.id}
              style={styles.result}
              onClick={() => {
                onPick(c.id);
                setQuery('');
                setResults([]);
                setOpen(false);
              }}
            >
              <span style={styles.resultName}>{c.title || c.slug}</span>
              <span style={styles.resultMeta}>
                {c.itemCount} place(s){c.isPublic ? '' : ' · private'}
              </span>
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
    height: 40,
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
    fontSize: 14,
  },
  results: {
    marginTop: t.spacing.xs,
    gap: 2,
    padding: t.spacing.xs,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray05,
    border: `1px solid ${t.colors.white + t.colorOpacity(0.08)}`,
    maxHeight: 240,
    overflowY: 'auto',
  },
  result: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 2,
    padding: t.spacing.s,
    borderRadius: t.borderRadius.small,
    border: 0,
    background: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    color: t.colors.white,
  },
  resultName: { fontSize: 14, fontWeight: 600 },
  resultMeta: { fontSize: 12, color: t.colors.dark05 },
}));
