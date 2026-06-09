import { useEffect, useState } from 'react';
import { MdSearch } from 'react-icons/md';
import { PoiAdminResponse } from '~/api/api';
import { useApi } from '~/hooks/useApi';
import { mkUseStyles, useTheme } from '~/utils/theme';

type PoiPickerProps = {
  onPick: (poiId: string) => void;
};

const poiLocation = (poi: PoiAdminResponse) =>
  [poi.city, poi.region, poi.country].filter(Boolean).join(', ');

export const PoiPicker = ({ onPick }: PoiPickerProps) => {
  const styles = useStyles();
  const theme = useTheme();
  const { blogPoiApi } = useApi();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PoiAdminResponse[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!blogPoiApi || !query.trim()) {
      setResults([]);
      return;
    }
    const handle = setTimeout(async () => {
      try {
        const { data } = await blogPoiApi.poiControllerListAdmin({ search: query.trim(), take: 8 });
        setResults(data.pois);
      } catch (e) {
        console.error('Error searching POIs:', e);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [query, blogPoiApi]);

  return (
    <div style={styles.wrap}>
      <div style={styles.searchBox}>
        <MdSearch size={18} color={theme.colors.dark05} />
        <input
          style={styles.input}
          value={query}
          placeholder='Search a place to add…'
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
      </div>
      {open && results.length ? (
        <div style={styles.results}>
          {results.map((poi) => (
            <button
              key={poi.id}
              style={styles.result}
              onClick={() => {
                onPick(poi.id);
                setQuery('');
                setResults([]);
                setOpen(false);
              }}
            >
              <span style={styles.resultName}>{poi.name}</span>
              {poiLocation(poi) ? <span style={styles.resultLoc}>{poiLocation(poi)}</span> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  wrap: {
    position: 'relative',
  },
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
    gap: 2,
    padding: t.spacing.s,
    borderRadius: t.borderRadius.small,
    border: 0,
    background: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    color: t.colors.white,
  },
  resultName: {
    fontSize: 14,
    fontWeight: 600,
  },
  resultLoc: {
    fontSize: 12,
    color: t.colors.dark05,
  },
}));
