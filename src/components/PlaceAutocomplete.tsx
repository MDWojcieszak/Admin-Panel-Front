import { CSSProperties, useEffect, useRef, useState } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { FiMapPin, FiSearch } from 'react-icons/fi';
import { Loader } from '~/components/Loader';
import { mkUseStyles, useTheme } from '~/utils/theme';

const KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
const LIBRARIES: 'places'[] = ['places'];

export const isPlacesEnabled = Boolean(KEY);

export type ParsedPlace = {
  name?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  country?: string;
  /** ISO 3166-1 alpha-2 (Google short_name) — used to match a BlogCountry by its `code`. */
  countryCode?: string;
  region?: string;
  city?: string;
  googlePlaceId?: string;
};

type PlaceAutocompleteProps = {
  onPlace: (place: ParsedPlace) => void;
  placeholder?: string;
  /** Applied to the outer wrapper (width, margins). The field itself is styled here. */
  style?: CSSProperties;
};

// The bits of the Places (New) programmatic API used here; @types lags behind it.
type Prediction = {
  placeId: string;
  text?: { text: string };
  mainText?: { text: string };
  secondaryText?: { text: string };
  toPlace: () => google.maps.places.Place;
};
type PlacesLib = {
  AutocompleteSuggestion: {
    fetchAutocompleteSuggestions: (request: {
      input: string;
      sessionToken?: unknown;
    }) => Promise<{ suggestions: { placePrediction?: Prediction | null }[] }>;
  };
  AutocompleteSessionToken: new () => unknown;
};

/**
 * Place search in the panel's own look. Google's PlaceAutocompleteElement
 * brings its own field and dropdown that no styling reaches, so this asks the
 * Places (New) API for suggestions itself and draws them like every other
 * menu here. One session token per search keeps the lookups billed as one.
 * Renders nothing when no API key is configured.
 */
export const PlaceAutocomplete = ({ onPlace, placeholder, style }: PlaceAutocompleteProps) => {
  const styles = useStyles();
  const theme = useTheme();
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-maps-script',
    googleMapsApiKey: KEY ?? '',
    libraries: LIBRARIES,
  });

  const [query, setQuery] = useState('');
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const libRef = useRef<PlacesLib>();
  const tokenRef = useRef<unknown>();
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoaded) return;
    google.maps
      .importLibrary('places')
      .then((lib) => {
        libRef.current = lib as unknown as PlacesLib;
      })
      .catch((e) => console.error('Error loading Places library:', e));
  }, [isLoaded]);

  // Suggestions follow the typing, after a short pause.
  useEffect(() => {
    const term = query.trim();
    if (!term) {
      setPredictions([]);
      return;
    }
    const timer = window.setTimeout(async () => {
      const lib = libRef.current;
      if (!lib) return;
      tokenRef.current ??= new lib.AutocompleteSessionToken();
      setLoading(true);
      try {
        const { suggestions } = await lib.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: term,
          sessionToken: tokenRef.current,
        });
        setPredictions(suggestions.map((s) => s.placePrediction).filter((p): p is Prediction => Boolean(p)));
        setActive(0);
        setOpen(true);
      } catch (e) {
        console.error('Error fetching place suggestions:', e);
        setPredictions([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const pick = async (prediction: Prediction) => {
    setOpen(false);
    setQuery(prediction.mainText?.text ?? prediction.text?.text ?? '');
    const place = prediction.toPlace();
    try {
      await place.fetchFields({ fields: ['displayName', 'formattedAddress', 'location', 'addressComponents', 'id'] });
    } catch (e) {
      console.error('Error fetching place fields:', e);
      return;
    } finally {
      // The pick ends the billing session; the next search starts a new one.
      tokenRef.current = undefined;
    }
    const find = (type: string) => place.addressComponents?.find((c) => c.types.includes(type));
    const comp = (type: string) => find(type)?.longText ?? undefined;
    const loc = place.location as google.maps.LatLng | undefined;
    onPlace({
      name: place.displayName ?? undefined,
      latitude: loc?.lat?.(),
      longitude: loc?.lng?.(),
      address: place.formattedAddress ?? undefined,
      country: comp('country'),
      countryCode: find('country')?.shortText ?? undefined,
      region: comp('administrative_area_level_1'),
      city: comp('locality') ?? comp('postal_town'),
      googlePlaceId: place.id ?? undefined,
    });
  };

  if (!KEY || loadError) return null;

  return (
    <div ref={wrapRef} style={{ ...styles.wrap, ...style }}>
      <label style={styles.searchBox}>
        <FiSearch size={15} />
        <input
          value={query}
          disabled={!isLoaded}
          placeholder={isLoaded ? placeholder ?? 'Search a place…' : 'Loading Google Places…'}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => predictions.length && setOpen(true)}
          onKeyDown={(e) => {
            if (!open || !predictions.length) return;
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setActive((i) => Math.min(i + 1, predictions.length - 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setActive((i) => Math.max(i - 1, 0));
            } else if (e.key === 'Enter') {
              e.preventDefault();
              pick(predictions[active]);
            } else if (e.key === 'Escape') {
              setOpen(false);
            }
          }}
          style={styles.input}
        />
        {loading ? <Loader /> : null}
      </label>

      {open && predictions.length ? (
        <div style={styles.menu}>
          {predictions.map((prediction, index) => (
            <button
              key={prediction.placeId}
              type='button'
              onMouseEnter={() => setActive(index)}
              onClick={() => pick(prediction)}
              style={{ ...styles.option, ...(index === active ? styles.optionActive : {}) }}
            >
              <FiMapPin size={14} color={theme.colors.blue04} style={{ flexShrink: 0 }} />
              <span style={styles.optionText}>
                <span style={styles.optionMain}>{prediction.mainText?.text ?? prediction.text?.text}</span>
                {prediction.secondaryText?.text ? (
                  <span style={styles.optionSecondary}>{prediction.secondaryText.text}</span>
                ) : null}
              </span>
            </button>
          ))}
          <span style={styles.attribution}>Powered by Google</span>
        </div>
      ) : null}
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  wrap: { position: 'relative', width: '100%' },
  searchBox: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    height: 44,
    padding: `0 ${t.spacing.m}px`,
    boxSizing: 'border-box',
    borderRadius: t.borderRadius.default,
    color: t.colors.dark05,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.5),
    cursor: 'text',
  },
  input: {
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
  menu: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 40,
    maxHeight: 320,
    overflowY: 'auto',
    gap: 2,
    padding: t.spacing.xs,
    borderRadius: t.borderRadius.large,
    backgroundColor: t.colors.gray04,
    border: `1px solid ${t.colors.white + t.colorOpacity(0.08)}`,
  },
  option: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    padding: '8px 10px',
    border: 'none',
    borderRadius: t.borderRadius.default,
    textAlign: 'left',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    transition: 'background-color 0.12s ease',
  },
  optionActive: { backgroundColor: t.colors.white + t.colorOpacity(0.06) },
  optionText: { display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 },
  optionMain: { fontSize: 14, fontWeight: 600, color: t.colors.white },
  optionSecondary: {
    fontSize: 12,
    color: t.colors.dark05,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  attribution: { padding: '4px 10px 2px', fontSize: 10, color: t.colors.dark05, textAlign: 'right' },
}));
