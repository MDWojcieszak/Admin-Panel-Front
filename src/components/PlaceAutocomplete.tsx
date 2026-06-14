import { CSSProperties, useEffect, useRef } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import '~/components/PlaceAutocomplete.css';

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
  style?: CSSProperties;
};

/**
 * Place search built on the Places API (New) `PlaceAutocompleteElement` (the legacy `Autocomplete`
 * widget triggers LegacyApiNotActivatedMapError on projects without the old API enabled). The selection
 * event has shifted across API versions, so we handle both `gmp-select` (placePrediction) and the older
 * `gmp-placeselect` (place). Renders nothing when no API key is configured.
 */
export const PlaceAutocomplete = ({ onPlace, placeholder, style }: PlaceAutocompleteProps) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-maps-script',
    googleMapsApiKey: KEY ?? '',
    libraries: LIBRARIES,
  });
  const hostRef = useRef<HTMLDivElement>(null);
  const onPlaceRef = useRef(onPlace);
  onPlaceRef.current = onPlace;

  useEffect(() => {
    const host = hostRef.current;
    if (!isLoaded || !host) return;
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    const onSelect = async (event: Event) => {
      const ev = event as unknown as {
        placePrediction?: { toPlace: () => google.maps.places.Place };
        place?: google.maps.places.Place;
      };
      const place = ev.placePrediction?.toPlace() ?? ev.place;
      if (!place) return;
      try {
        await place.fetchFields({ fields: ['displayName', 'formattedAddress', 'location', 'addressComponents', 'id'] });
      } catch (e) {
        console.error('Error fetching place fields:', e);
        return;
      }
      const find = (type: string) => place.addressComponents?.find((c) => c.types.includes(type));
      const comp = (type: string) => find(type)?.longText ?? undefined;
      const loc = place.location as google.maps.LatLng | undefined;
      onPlaceRef.current({
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

    // New API: libraries are pulled in via importLibrary(), not read off google.maps.places directly.
    google.maps
      .importLibrary('places')
      .then((lib) => {
        // PlaceAutocompleteElement isn't on the PlacesLibrary type in this @types version (still beta there).
        const Ctor = (lib as unknown as { PlaceAutocompleteElement?: new () => HTMLElement }).PlaceAutocompleteElement;
        if (cancelled || !host || typeof Ctor !== 'function') return;
        const el = new Ctor();
        el.className = 'blog-place-ac';
        if (placeholder) el.setAttribute('placeholder', placeholder);
        el.addEventListener('gmp-select', onSelect);
        el.addEventListener('gmp-placeselect', onSelect);
        host.replaceChildren(el);
        cleanup = () => {
          el.removeEventListener('gmp-select', onSelect);
          el.removeEventListener('gmp-placeselect', onSelect);
          host.replaceChildren();
        };
      })
      .catch((e) => console.error('Error loading Places library:', e));

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [isLoaded, placeholder]);

  if (!KEY || loadError) return null;
  if (!isLoaded) return <input disabled placeholder='Loading Google Places…' style={style} />;
  // The caller's style is the themed frame; the transparent web component fills it (padding lives on the
  // input). No overflow:hidden — that would clip the predictions dropdown the element renders below itself.
  return <div ref={hostRef} style={{ ...style, padding: 0 }} />;
};
