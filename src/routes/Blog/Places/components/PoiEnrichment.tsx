import { useEffect, useState } from 'react';
import { MdAdd, MdClose } from 'react-icons/md';
import { CategoryKind, PoiHoursResponse, PoiImageResponse, Weekday } from '~/api/api';
import { ImageService, ImageType } from '~/apiOld/Image';
import { useApi } from '~/hooks/useApi';
import { categoryLabel, useBlogCategories } from '~/routes/Blog/hooks/useBlogCategories';
import { MediaThumb } from '~/routes/Blog/Editor/components/MediaThumb';
import { mkUseStyles } from '~/utils/theme';

/** ATTRACTION categories — multi-select chips. */
export const PoiCategoriesField = ({ poiId, locale, current }: { poiId: string; locale: string; current: string[] }) => {
  const styles = useStyles();
  const { blogPoiApi } = useApi();
  const { categories } = useBlogCategories(CategoryKind.Attraction, locale);
  const [selected, setSelected] = useState<string[]>(current);

  const toggle = async (id: string) => {
    if (!blogPoiApi) return;
    const next = selected.includes(id) ? selected.filter((c) => c !== id) : [...selected, id];
    setSelected(next);
    try {
      await blogPoiApi.poiControllerSetCategories({ id: poiId, setPoiCategoriesDto: { categoryIds: next } });
    } catch (e) {
      console.error('Error setting POI categories:', e);
    }
  };

  return (
    <div style={styles.section}>
      <span style={styles.label}>Categories</span>
      <div style={styles.chips}>
        {categories.length ? (
          categories.map((c) => {
            const on = selected.includes(c.id);
            return (
              <button key={c.id} style={{ ...styles.chip, ...(on ? styles.chipOn : null) }} onClick={() => toggle(c.id)}>
                {categoryLabel(c, locale)}
              </button>
            );
          })
        ) : (
          <span style={styles.muted}>No ATTRACTION categories yet.</span>
        )}
      </div>
    </div>
  );
};

const DAYS: Weekday[] = [Weekday.Mon, Weekday.Tue, Weekday.Wed, Weekday.Thu, Weekday.Fri, Weekday.Sat, Weekday.Sun];
type HourRow = { closed: boolean; opensAt: string; closesAt: string };

/** Opening hours per weekday. */
export const PoiHoursField = ({ poiId, current }: { poiId: string; current: PoiHoursResponse[] }) => {
  const styles = useStyles();
  const { blogPoiApi } = useApi();
  const [rows, setRows] = useState<Record<string, HourRow>>(() => {
    const map: Record<string, HourRow> = {};
    DAYS.forEach((d) => {
      const found = current.find((h) => h.weekday === d);
      map[d] = { closed: found?.closed ?? false, opensAt: found?.opensAt ?? '', closesAt: found?.closesAt ?? '' };
    });
    return map;
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    if (!blogPoiApi) return;
    setSaving(true);
    setSaved(false);
    try {
      await blogPoiApi.poiControllerSetHours({
        id: poiId,
        setPoiHoursDto: {
          hours: DAYS.map((d) => ({
            weekday: d,
            closed: rows[d].closed,
            opensAt: rows[d].closed || !rows[d].opensAt ? null : rows[d].opensAt,
            closesAt: rows[d].closed || !rows[d].closesAt ? null : rows[d].closesAt,
          })),
        },
      });
      setSaved(true);
    } catch (e) {
      console.error('Error saving hours:', e);
    } finally {
      setSaving(false);
    }
  };

  const set = (day: string, patch: Partial<HourRow>) => setRows((r) => ({ ...r, [day]: { ...r[day], ...patch } }));

  return (
    <div style={styles.section}>
      <span style={styles.label}>Opening hours</span>
      {DAYS.map((d) => (
        <div key={d} style={styles.hourRow}>
          <span style={styles.day}>{d}</span>
          <label style={styles.closedLabel}>
            <input type='checkbox' checked={rows[d].closed} onChange={(e) => set(d, { closed: e.target.checked })} /> closed
          </label>
          {!rows[d].closed ? (
            <>
              <input style={styles.time} type='time' value={rows[d].opensAt} onChange={(e) => set(d, { opensAt: e.target.value })} />
              <span style={styles.dash}>–</span>
              <input style={styles.time} type='time' value={rows[d].closesAt} onChange={(e) => set(d, { closesAt: e.target.value })} />
            </>
          ) : null}
        </div>
      ))}
      <div style={styles.hoursFooter}>
        <button style={styles.saveBtn} onClick={save} disabled={saving}>
          {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save hours'}
        </button>
      </div>
    </div>
  );
};

/** POI image gallery — add from the image library, remove. */
export const PoiGalleryField = ({ poiId, current }: { poiId: string; current: PoiImageResponse[] }) => {
  const styles = useStyles();
  const { blogPoiApi } = useApi();
  const [images, setImages] = useState<PoiImageResponse[]>(current);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [library, setLibrary] = useState<ImageType[]>([]);

  useEffect(() => {
    if (!pickerOpen) return;
    ImageService.getList({ take: 40, skip: 0 })
      .then((d) => setLibrary(d.images))
      .catch((e) => console.error('Error loading image library:', e));
  }, [pickerOpen]);

  const add = async (imageId: string) => {
    if (!blogPoiApi) return;
    try {
      const { data } = await blogPoiApi.poiControllerAddImage({ id: poiId, addPoiImageDto: { imageId } });
      setImages(data.images);
      setPickerOpen(false);
    } catch (e) {
      console.error('Error adding POI image:', e);
    }
  };

  const remove = async (linkId: string) => {
    if (!blogPoiApi) return;
    try {
      await blogPoiApi.poiControllerDeleteImage({ imageId: linkId });
      setImages((prev) => prev.filter((i) => i.id !== linkId));
    } catch (e) {
      console.error('Error removing POI image:', e);
    }
  };

  return (
    <div style={styles.section}>
      <span style={styles.label}>Gallery</span>
      {images.length ? (
        <div style={styles.galleryGrid}>
          {images.map((img) => (
            <div key={img.id} style={styles.tile}>
              <MediaThumb imageId={img.imageId} style={styles.fill} />
              <button style={styles.removeImg} title='Remove' onClick={() => remove(img.id)}>
                <MdClose size={14} />
              </button>
            </div>
          ))}
        </div>
      ) : null}
      <button style={styles.addImg} onClick={() => setPickerOpen((o) => !o)}>
        <MdAdd size={16} /> Add image
      </button>
      {pickerOpen ? (
        <div style={styles.picker}>
          {library.map((img) => (
            <button key={img.id} style={styles.tile} onClick={() => add(img.id)}>
              <MediaThumb imageId={img.id} style={styles.fill} />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  section: {
    gap: t.spacing.s,
    paddingTop: t.spacing.m,
    borderTop: `1px solid ${t.colors.white + t.colorOpacity(0.06)}`,
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: t.colors.blue04,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: t.spacing.xs,
  },
  chip: {
    height: 30,
    padding: `0 ${t.spacing.s}px`,
    borderRadius: t.borderRadius.default,
    border: `1px solid ${t.colors.white + t.colorOpacity(0.1)}`,
    background: 'transparent',
    color: t.colors.dark05,
    cursor: 'pointer',
    fontSize: 13,
  },
  chipOn: {
    color: t.colors.white,
    backgroundColor: t.colors.blue + t.colorOpacity(0.25),
    border: `1px solid ${t.colors.blue + t.colorOpacity(0.4)}`,
  },
  muted: {
    fontSize: 13,
    color: t.colors.dark05,
  },
  hourRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
  },
  day: {
    width: 40,
    fontSize: 13,
    fontWeight: 600,
  },
  closedLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    fontSize: 13,
    color: t.colors.dark05,
    cursor: 'pointer',
  },
  time: {
    height: 32,
    boxSizing: 'border-box',
    padding: `0 ${t.spacing.s}px`,
    borderRadius: t.borderRadius.small,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
    color: t.colors.white,
    border: 0,
    outline: 'none',
    colorScheme: 'dark',
    fontSize: 13,
  },
  dash: {
    color: t.colors.dark05,
  },
  hoursFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  saveBtn: {
    height: 32,
    padding: `0 ${t.spacing.m}px`,
    borderRadius: t.borderRadius.default,
    border: `1px solid ${t.colors.white + t.colorOpacity(0.12)}`,
    background: 'transparent',
    color: t.colors.white,
    cursor: 'pointer',
    fontSize: 13,
  },
  galleryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: t.spacing.s,
  },
  tile: {
    position: 'relative',
    aspectRatio: '1 / 1',
    borderRadius: t.borderRadius.default,
    overflow: 'hidden',
    border: 0,
    padding: 0,
    cursor: 'pointer',
    backgroundColor: t.colors.gray05,
  },
  fill: {
    width: '100%',
    height: '100%',
  },
  removeImg: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    border: 0,
    cursor: 'pointer',
    color: t.colors.white,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  addImg: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.spacing.xs,
    alignSelf: 'flex-start',
    height: 34,
    padding: `0 ${t.spacing.m}px`,
    borderRadius: t.borderRadius.default,
    border: `1px dashed ${t.colors.white + t.colorOpacity(0.2)}`,
    background: 'transparent',
    color: t.colors.white,
    cursor: 'pointer',
    fontSize: 13,
    display: 'flex',
  },
  picker: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: t.spacing.s,
    maxHeight: 200,
    overflowY: 'auto',
    padding: t.spacing.s,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray05 + t.colorOpacity(0.6),
  },
}));
