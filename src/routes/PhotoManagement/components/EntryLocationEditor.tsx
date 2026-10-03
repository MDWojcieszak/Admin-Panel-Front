import { Suspense, lazy, useEffect, useState } from 'react';
import { FiMapPin, FiSearch } from 'react-icons/fi';
import { PhotoEntryLocationDto, PhotoEntryLocationResponse, PoiAdminResponse } from '~/api/api';
import { Button } from '~/components/Button';
import { Loader } from '~/components/Loader';
import type { MapPoint } from '~/components/MapPointPicker';
import { PlaceAutocomplete, isPlacesEnabled } from '~/components/PlaceAutocomplete';
import { SegmentedTabs } from '~/components/SegmentedTabs';
import { useApi } from '~/hooks/useApi';
import { mkUseStyles, useTheme } from '~/utils/theme';

type Mode = 'map' | 'search' | 'poi' | 'coords';

// MapLibre is heavy; it loads only when a map is actually shown.
const MapPointPicker = lazy(() => import('~/components/MapPointPicker'));

type EntryLocationEditorProps = {
  location?: PhotoEntryLocationResponse | null;
  saving: boolean;
  /** `null` removes the location. */
  onSave: (location: PhotoEntryLocationDto | null) => Promise<void>;
};

const formatCoords = (lat: number, lng: number) => `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

/** Reads "50.0614, 19.9366" pasted from a map into its two numbers. */
const parsePair = (value: string): [number, number] | null => {
  const parts = value
    .split(/[,\s]+/)
    .filter(Boolean)
    .map(Number);
  if (parts.length !== 2 || parts.some((n) => Number.isNaN(n))) return null;
  return [parts[0], parts[1]];
};

/**
 * Where the session happens — what the sky and the forecast are worked out
 * for. Saved on its own, outside the card's Edit mode: the name and dates lock
 * once folders exist, the place does not. A blog POI only lends its
 * coordinates; the session is not linked to the article.
 */
export const EntryLocationEditor = ({ location, saving, onSave }: EntryLocationEditorProps) => {
  const styles = useStyles();
  const theme = useTheme();
  const [editing, setEditing] = useState(false);
  const [mode, setMode] = useState<Mode>('map');

  const save = async (next: PhotoEntryLocationDto | null) => {
    await onSave(next);
    setEditing(false);
  };

  if (!editing) {
    return (
      <div style={styles.summary}>
        <FiMapPin size={16} color={location ? theme.colors.blue : theme.colors.dark05} />
        {location ? (
          <div style={styles.summaryText}>
            <span style={styles.placeName}>{location.name || formatCoords(location.latitude, location.longitude)}</span>
            <span style={styles.muted}>
              {location.name ? `${formatCoords(location.latitude, location.longitude)} · ` : ''}
              {location.timezone}
            </span>
          </div>
        ) : (
          <span style={{ ...styles.muted, flex: 1 }}>
            No location yet — set one to see the sun, the moon and the weather for this trip.
          </span>
        )}
        <div style={styles.actions}>
          <Button label={location ? 'Change' : 'Set location'} variant='secondary' onClick={() => setEditing(true)} />
          {location ? <Button label='Remove' variant='secondary' loading={saving} onClick={() => save(null)} /> : null}
        </div>
        {location ? (
          <Suspense fallback={null}>
            <MapPointPicker value={location} height={160} style={{ flexBasis: '100%' }} />
          </Suspense>
        ) : null}
      </div>
    );
  }

  return (
    <div style={styles.editor}>
      <div style={styles.editorHead}>
        <SegmentedTabs
          items={[
            { label: 'Pick on map', value: 'map' },
            ...(isPlacesEnabled ? [{ label: 'Search a place', value: 'search' }] : []),
            { label: 'From a blog POI', value: 'poi' },
            { label: 'Coordinates', value: 'coords' },
          ]}
          selected={mode}
          handleSelect={(value) => setMode(value as Mode)}
          layoutId='entry-location-mode'
        />
        <Button label='Cancel' variant='secondary' onClick={() => setEditing(false)} />
      </div>

      {mode === 'map' ? (
        <MapForm initial={location} saving={saving} onSubmit={save} />
      ) : mode === 'search' ? (
        <PlaceAutocomplete
          placeholder='Search a place…'
          onPlace={(place) => {
            if (place.latitude == null || place.longitude == null) return;
            save({ name: place.name ?? place.address ?? null, latitude: place.latitude, longitude: place.longitude });
          }}
        />
      ) : mode === 'poi' ? (
        <PoiSearch onPick={(poi) => save({ name: poi.name, latitude: poi.latitude, longitude: poi.longitude })} />
      ) : (
        <CoordinatesForm initial={location} saving={saving} onSubmit={save} />
      )}
    </div>
  );
};

const MapForm = ({
  initial,
  saving,
  onSubmit,
}: {
  initial?: PhotoEntryLocationResponse | null;
  saving: boolean;
  onSubmit: (location: PhotoEntryLocationDto) => void;
}) => {
  const styles = useStyles();
  const [point, setPoint] = useState<MapPoint | null>(
    initial ? { latitude: initial.latitude, longitude: initial.longitude } : null,
  );
  const [name, setName] = useState(initial?.name ?? '');

  return (
    <div style={styles.mapForm}>
      <Suspense fallback={<Loader />}>
        <MapPointPicker value={point} onChange={setPoint} height={340} />
      </Suspense>
      <div style={styles.coordsForm}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder='Name (optional)'
          style={styles.field}
        />
        <span style={styles.muted}>
          {point ? formatCoords(point.latitude, point.longitude) : 'Click the map to drop a pin'}
        </span>
        <Button
          label='Save'
          disabled={!point}
          loading={saving}
          onClick={() => point && onSubmit({ name: name.trim() || null, ...point })}
        />
      </div>
    </div>
  );
};

const PoiSearch = ({ onPick }: { onPick: (poi: PoiAdminResponse) => void }) => {
  const styles = useStyles();
  const { blogPoiApi } = useApi();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PoiAdminResponse[]>([]);

  useEffect(() => {
    if (!blogPoiApi || !query.trim()) {
      setResults([]);
      return;
    }
    const handle = window.setTimeout(async () => {
      try {
        const { data } = await blogPoiApi.poiControllerListAdmin({ search: query.trim(), take: 8 });
        setResults(data.pois);
      } catch {
        setResults([]);
      }
    }, 300);
    return () => window.clearTimeout(handle);
  }, [query, blogPoiApi]);

  return (
    <div style={styles.poiWrap}>
      <label style={styles.searchBox}>
        <FiSearch size={14} />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Search your blog places…'
          style={styles.searchInput}
        />
      </label>
      {results.length ? (
        <div style={styles.results}>
          {results.map((poi) => (
            <button key={poi.id} type='button' style={styles.result} onClick={() => onPick(poi)}>
              <span style={styles.placeName}>{poi.name}</span>
              <span style={styles.muted}>
                {[poi.city, poi.country].filter(Boolean).join(', ') || formatCoords(poi.latitude, poi.longitude)}
              </span>
            </button>
          ))}
        </div>
      ) : query.trim() ? (
        <span style={styles.muted}>No place matches.</span>
      ) : null}
    </div>
  );
};

const CoordinatesForm = ({
  initial,
  saving,
  onSubmit,
}: {
  initial?: PhotoEntryLocationResponse | null;
  saving: boolean;
  onSubmit: (location: PhotoEntryLocationDto) => void;
}) => {
  const styles = useStyles();
  const [name, setName] = useState(initial?.name ?? '');
  const [coords, setCoords] = useState(initial ? `${initial.latitude}, ${initial.longitude}` : '');
  const pair = parsePair(coords);
  const valid = Boolean(pair && Math.abs(pair[0]) <= 90 && Math.abs(pair[1]) <= 180);

  return (
    <div style={styles.coordsForm}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder='Name (optional)'
        style={styles.field}
      />
      <input
        value={coords}
        onChange={(e) => setCoords(e.target.value)}
        placeholder='Latitude, longitude — e.g. 49.2320, 19.9817'
        style={styles.field}
      />
      <Button
        label='Save'
        disabled={!valid}
        loading={saving}
        onClick={() => pair && onSubmit({ name: name.trim() || null, latitude: pair[0], longitude: pair[1] })}
      />
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  summary: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.s, flexWrap: 'wrap' },
  summaryText: { flex: 1, minWidth: 0, gap: 2 },
  placeName: { fontSize: 14, fontWeight: 600, color: t.colors.white },
  muted: { fontSize: 12, color: t.colors.dark05 },
  actions: { flexDirection: 'row', gap: t.spacing.s },
  editor: { gap: t.spacing.s },
  editorHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.s,
    flexWrap: 'wrap',
  },
  poiWrap: { gap: t.spacing.xs },
  searchBox: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    height: 40,
    padding: `0 ${t.spacing.s}px`,
    borderRadius: t.borderRadius.default,
    color: t.colors.dark05,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.5),
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    color: t.colors.white,
    fontSize: 14,
    padding: 0,
  },
  results: { gap: 2 },
  result: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 2,
    padding: '8px 10px',
    border: 'none',
    borderRadius: t.borderRadius.default,
    textAlign: 'left',
    cursor: 'pointer',
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.3),
  },
  mapForm: { gap: t.spacing.s },
  coordsForm: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.s, flexWrap: 'wrap' },
  field: {
    flex: 1,
    minWidth: 180,
    height: 40,
    padding: `0 ${t.spacing.s}px`,
    border: 'none',
    outline: 'none',
    borderRadius: t.borderRadius.default,
    color: t.colors.white,
    fontSize: 14,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.5),
  },
}));
