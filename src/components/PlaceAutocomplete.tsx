import { CSSProperties, useRef } from 'react';
import { Autocomplete, useJsApiLoader } from '@react-google-maps/api';

const KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
const LIBRARIES: 'places'[] = ['places'];

export const isPlacesEnabled = Boolean(KEY);

export type ParsedPlace = {
  name?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  country?: string;
  region?: string;
  city?: string;
  googlePlaceId?: string;
};

type PlaceAutocompleteProps = {
  onPlace: (place: ParsedPlace) => void;
  placeholder?: string;
  style?: CSSProperties;
};

/** Google Places search input. Renders nothing when no API key is configured. */
export const PlaceAutocomplete = ({ onPlace, placeholder, style }: PlaceAutocompleteProps) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-maps-script',
    googleMapsApiKey: KEY ?? '',
    libraries: LIBRARIES,
  });
  const ref = useRef<google.maps.places.Autocomplete | null>(null);

  if (!KEY || loadError) return null;
  if (!isLoaded) return <input disabled placeholder='Loading Google Places…' style={style} />;

  const handleChanged = () => {
    const place = ref.current?.getPlace();
    if (!place) return;
    const comp = (type: string) => place.address_components?.find((c) => c.types.includes(type))?.long_name;
    onPlace({
      name: place.name ?? undefined,
      latitude: place.geometry?.location?.lat(),
      longitude: place.geometry?.location?.lng(),
      address: place.formatted_address ?? undefined,
      country: comp('country'),
      region: comp('administrative_area_level_1'),
      city: comp('locality') ?? comp('postal_town'),
      googlePlaceId: place.place_id ?? undefined,
    });
  };

  return (
    <Autocomplete onLoad={(ac) => (ref.current = ac)} onPlaceChanged={handleChanged}>
      <input placeholder={placeholder ?? 'Search a place on Google…'} style={style} />
    </Autocomplete>
  );
};
