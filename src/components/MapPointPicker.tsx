import { Map as MapLibreMap, Marker, NavigationControl, setWorkerUrl } from 'maplibre-gl';
// In a production build MapLibre's own worker lookup points nowhere, so Vite
// builds the worker and hands over its URL. In dev the dependency is served
// unbundled (see vite.config) and its own lookup works — while a dev-served
// ?worker carries the HMR client, which cannot run inside a worker.
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import 'maplibre-gl/dist/maplibre-gl.css';
import { CSSProperties, useEffect, useRef } from 'react';
import { Theme, useTheme } from '~/utils/theme';

export type MapPoint = { latitude: number; longitude: number };

type MapPointPickerProps = {
  value?: MapPoint | null;
  /** Without it the map is a preview: no clicking, no dragging the pin. */
  onChange?: (point: MapPoint) => void;
  height?: number;
  style?: CSSProperties;
};

/**
 * Open data end to end: MapLibre GL (BSD) drawing OpenFreeMap vector tiles
 * (OpenStreetMap, no key, no quota). Vector tiles are what make it fit the
 * panel — the style is recoloured from the theme instead of being a stock
 * look pasted in.
 */
const STYLE_URL: Record<Theme['mode'], string> = {
  dark: 'https://tiles.openfreemap.org/styles/dark',
  light: 'https://tiles.openfreemap.org/styles/positron',
};

if (import.meta.env.PROD) setWorkerUrl(maplibreWorkerUrl);

/** Central Europe, zoomed out, until a point is set. */
const DEFAULT_CENTER: [number, number] = [19.4, 51.9];

const paletteFor = (theme: Theme) =>
  theme.mode === 'dark'
    ? {
        background: theme.colors.gray04,
        water: '#0E2433',
        green: '#122019',
        building: theme.colors.gray03,
        text: theme.colors.dark05,
        halo: theme.colors.gray05,
        // The stock dark style draws motorways black, which cuts through the map.
        motorway: theme.colors.gray01,
      }
    : {
        background: theme.colors.gray045,
        water: theme.colors.blue02,
        green: '#E1EEE4',
        building: theme.colors.gray03,
        text: theme.colors.dark04,
        halo: theme.colors.gray05,
        motorway: undefined,
      };

/** Repaints the base style in the panel's colours; layers a style lacks are skipped. */
const applyTheme = (map: MapLibreMap, theme: Theme) => {
  const p = paletteFor(theme);
  const set = (layer: string, prop: Parameters<MapLibreMap['setPaintProperty']>[1], value: unknown) => {
    if (!map.getLayer(layer)) return;
    try {
      map.setPaintProperty(layer, prop, value);
    } catch {
      // A property the layer type does not have; nothing to recolour.
    }
  };

  map.getStyle().layers.forEach((layer) => {
    const id = layer.id;
    if (layer.type === 'background') set(id, 'background-color', p.background);
    else if (id.startsWith('water') && layer.type === 'fill') set(id, 'fill-color', p.water);
    else if (id.startsWith('waterway') && layer.type === 'line') set(id, 'line-color', p.water);
    else if (/park|wood|grass|forest/.test(id) && layer.type === 'fill') set(id, 'fill-color', p.green);
    else if (id.startsWith('building') && layer.type === 'fill') set(id, 'fill-color', p.building);
    else if (p.motorway && (id.includes('motorway_inner') || id.startsWith('aeroway-runway'))) {
      set(id, 'line-color', p.motorway);
    } else if (layer.type === 'symbol') {
      set(id, 'text-color', p.text);
      set(id, 'text-halo-color', p.halo);
    }
  });
};

const createPin = (theme: Theme) => {
  const el = document.createElement('div');
  el.style.width = '30px';
  el.style.height = '40px';
  el.style.filter = 'drop-shadow(0 4px 6px rgba(0,0,0,0.45))';
  el.innerHTML = `<svg viewBox="0 0 30 40" width="30" height="40" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 39C15 39 28 24.5 28 14.5C28 7 22.2 1 15 1C7.8 1 2 7 2 14.5C2 24.5 15 39 15 39Z" fill="${theme.colors.blue}" stroke="white" stroke-width="2"/>
    <circle cx="15" cy="14.5" r="5" fill="white"/>
  </svg>`;
  return el;
};

/**
 * A map to put a pin on: click to place it, drag to adjust. With no
 * `onChange` it only shows the point.
 */
/** Zoom buttons in the panel's colours; MapLibre ships them white. Injected once. */
const CONTROLS_CSS = `
.panel-map .maplibregl-ctrl-group {
  background: var(--map-ctrl-bg);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}
.panel-map .maplibregl-ctrl-group button + button { border-top-color: var(--map-ctrl-border); }
.panel-map .maplibregl-ctrl-group button .maplibregl-ctrl-icon { filter: var(--map-ctrl-icon-filter); }
.panel-map .maplibregl-ctrl-attrib.maplibregl-compact { background: var(--map-ctrl-bg); color: var(--map-ctrl-fg); }
.panel-map .maplibregl-ctrl-attrib a { color: var(--map-ctrl-fg); }
`;

const ensureControlsCss = () => {
  if (document.getElementById('panel-map-css')) return;
  const tag = document.createElement('style');
  tag.id = 'panel-map-css';
  tag.textContent = CONTROLS_CSS;
  document.head.appendChild(tag);
};

export const MapPointPicker = ({ value, onChange, height = 320, style }: MapPointPickerProps) => {
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap>();
  const markerRef = useRef<Marker>();
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const interactive = Boolean(onChange);

  const placeMarker = (map: MapLibreMap, point: MapPoint) => {
    const lngLat: [number, number] = [point.longitude, point.latitude];
    if (markerRef.current) {
      markerRef.current.setLngLat(lngLat);
      return;
    }
    const marker = new Marker({ element: createPin(theme), anchor: 'bottom', draggable: interactive })
      .setLngLat(lngLat)
      .addTo(map);
    marker.on('dragend', () => {
      const { lat, lng } = marker.getLngLat();
      onChangeRef.current?.({ latitude: lat, longitude: lng });
    });
    markerRef.current = marker;
  };

  useEffect(() => {
    if (!containerRef.current) return;
    ensureControlsCss();
    const map = new MapLibreMap({
      container: containerRef.current,
      style: STYLE_URL[theme.mode],
      center: value ? [value.longitude, value.latitude] : DEFAULT_CENTER,
      zoom: value ? 11 : 4.5,
      interactive,
      attributionControl: { compact: true },
    });
    mapRef.current = map;

    map.on('style.load', () => applyTheme(map, theme));
    if (interactive) {
      map.addControl(new NavigationControl({ showCompass: false }), 'top-right');
      map.getCanvas().style.cursor = 'crosshair';
      map.on('click', (event) => {
        const point = { latitude: event.lngLat.lat, longitude: event.lngLat.lng };
        placeMarker(map, point);
        onChangeRef.current?.(point);
      });
    }
    if (value) placeMarker(map, value);

    return () => {
      markerRef.current = undefined;
      map.remove();
    };
    // The map is built once per theme mode; later points move the pin instead.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme.mode, interactive]);

  // A point set from outside (search, POI, typed coordinates) moves the pin
  // and brings it into view.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !value) return;
    const current = markerRef.current?.getLngLat();
    if (current && Math.abs(current.lat - value.latitude) < 1e-9 && Math.abs(current.lng - value.longitude) < 1e-9)
      return;
    placeMarker(map, value);
    map.easeTo({ center: [value.longitude, value.latitude], zoom: Math.max(map.getZoom(), 10) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.latitude, value?.longitude]);

  return (
    <div
      ref={containerRef}
      className='panel-map'
      style={{
        ['--map-ctrl-bg' as string]: theme.colors.gray02,
        ['--map-ctrl-fg' as string]: theme.colors.dark05,
        ['--map-ctrl-border' as string]: theme.colors.gray01,
        ['--map-ctrl-icon-filter' as string]: theme.mode === 'dark' ? 'invert(1)' : 'none',
        display: 'block',
        width: '100%',
        height,
        borderRadius: theme.borderRadius.default,
        overflow: 'hidden',
        ...style,
      }}
    />
  );
};

export default MapPointPicker;
