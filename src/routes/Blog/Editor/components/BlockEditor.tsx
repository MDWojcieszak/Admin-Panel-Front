import { useEffect, useMemo, useState } from 'react';
import { MdAdd, MdDashboardCustomize } from 'react-icons/md';
import { BlogSectionType, PatchSectionDto, ResolvedSectionResponse, UpsertSectionTranslationDto } from '~/api/api';
import { useApi } from '~/hooks/useApi';
import { SectionCard } from '~/routes/Blog/Editor/components/SectionCard';
import { SECTION_META, sectionDefaults } from '~/routes/Blog/Editor/sectionTypes';
import { useTemplates } from '~/routes/Blog/Templates/hooks/useTemplates';
import { mkUseStyles } from '~/utils/theme';

type BlockEditorProps = {
  postId: string;
  locale: string;
  sections: ResolvedSectionResponse[];
  activeSectionId?: string;
  onActivate: (id: string) => void;
  onRemoveImage: (sectionImageId: string) => void;
  onAddPoi: (sectionId: string, poiId: string) => void;
  onRemovePoi: (poiLinkId: string) => void;
  onChanged: () => void;
};

const byOrder = (a: ResolvedSectionResponse, b: ResolvedSectionResponse) => a.order - b.order;

export const BlockEditor = ({
  postId,
  locale,
  sections,
  activeSectionId,
  onActivate,
  onRemoveImage,
  onAddPoi,
  onRemovePoi,
  onChanged,
}: BlockEditorProps) => {
  const styles = useStyles();
  const { blogSectionsApi, blogTemplatesApi } = useApi();
  const { templates } = useTemplates();
  const [ordered, setOrdered] = useState<ResolvedSectionResponse[]>([]);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);

  const applyTemplate = async (templateId: string) => {
    if (!blogTemplatesApi) return;
    setTemplateOpen(false);
    try {
      await blogTemplatesApi.templateControllerApply({ postId, templateId });
      onChanged();
    } catch (e) {
      console.error('Error applying template:', e);
    }
  };

  useEffect(() => {
    setOrdered([...sections].sort(byOrder));
  }, [sections]);

  const grouped = useMemo(() => {
    const groups: Record<string, typeof SECTION_META> = {};
    SECTION_META.forEach((m) => {
      (groups[m.group] = groups[m.group] || []).push(m);
    });
    return groups;
  }, []);

  const addSection = async (type: BlogSectionType) => {
    if (!blogSectionsApi) return;
    setPaletteOpen(false);
    const nextOrder = ordered.length ? Math.max(...ordered.map((s) => s.order)) + 1 : 0;
    try {
      await blogSectionsApi.sectionControllerCreate({
        postId,
        createSectionDto: { type, order: nextOrder, locale, ...sectionDefaults(type) },
      });
      onChanged();
    } catch (e) {
      console.error('Error adding section:', e);
    }
  };

  const patchSection = async (id: string, patch: PatchSectionDto) => {
    if (!blogSectionsApi) return;
    try {
      await blogSectionsApi.sectionControllerPatch({ id, patchSectionDto: patch });
    } catch (e) {
      console.error('Error patching section:', e);
    }
  };

  const translateSection = async (id: string, patch: UpsertSectionTranslationDto) => {
    if (!blogSectionsApi) return;
    try {
      await blogSectionsApi.sectionControllerUpsertTranslation({ id, locale, upsertSectionTranslationDto: patch });
    } catch (e) {
      console.error('Error saving section text:', e);
    }
  };

  const deleteSection = async (id: string) => {
    if (!blogSectionsApi) return;
    try {
      await blogSectionsApi.sectionControllerDelete({ id });
      onChanged();
    } catch (e) {
      console.error('Error deleting section:', e);
    }
  };

  const moveSection = async (id: string, dir: -1 | 1) => {
    if (!blogSectionsApi) return;
    const idx = ordered.findIndex((s) => s.id === id);
    const swap = idx + dir;
    if (idx < 0 || swap < 0 || swap >= ordered.length) return;
    const next = [...ordered];
    [next[idx], next[swap]] = [next[swap], next[idx]];
    setOrdered(next);
    try {
      await blogSectionsApi.sectionControllerReorder({
        postId,
        reorderDto: { items: next.map((s, i) => ({ id: s.id, order: i })) },
      });
    } catch (e) {
      console.error('Error reordering sections:', e);
      onChanged();
    }
  };

  return (
    <div style={styles.container}>
      {ordered.map((s, i) => (
        <SectionCard
          key={s.id}
          section={s}
          locale={locale}
          isFirst={i === 0}
          isLast={i === ordered.length - 1}
          isActive={s.id === activeSectionId}
          onActivate={onActivate}
          onPatch={patchSection}
          onTranslate={translateSection}
          onMove={moveSection}
          onDelete={deleteSection}
          onRemoveImage={onRemoveImage}
          onAddPoi={onAddPoi}
          onRemovePoi={onRemovePoi}
        />
      ))}

      <div style={styles.addArea}>
        <div style={styles.addButtons}>
          <button style={styles.addButton} onClick={() => setPaletteOpen((o) => !o)}>
            <MdAdd size={18} /> Add block
          </button>
          {templates.length ? (
            <button style={styles.addButton} onClick={() => setTemplateOpen((o) => !o)}>
              <MdDashboardCustomize size={16} /> Use template
            </button>
          ) : null}
        </div>
        {templateOpen ? (
          <div style={styles.palette}>
            {templates.map((tpl) => (
              <button key={tpl.id} style={styles.paletteItem} title={`${tpl.blocks.length} block(s)`} onClick={() => applyTemplate(tpl.id)}>
                {tpl.name}
              </button>
            ))}
          </div>
        ) : null}
        {paletteOpen ? (
          <div style={styles.palette}>
            {Object.entries(grouped).map(([group, items]) => (
              <div key={group} style={styles.paletteGroup}>
                <span style={styles.paletteGroupTitle}>{group}</span>
                <div style={styles.paletteItems}>
                  {items.map((m) => (
                    <button key={m.type} style={styles.paletteItem} title={m.hint} onClick={() => addSection(m.type)}>
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    gap: t.spacing.m,
  },
  addArea: {
    gap: t.spacing.s,
    alignItems: 'flex-start',
  },
  addButtons: {
    flexDirection: 'row',
    gap: t.spacing.s,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.xs,
    height: 40,
    padding: `0 ${t.spacing.m}px`,
    borderRadius: t.borderRadius.default,
    border: `1px dashed ${t.colors.white + t.colorOpacity(0.2)}`,
    background: 'transparent',
    color: t.colors.white,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
    display: 'flex',
  },
  palette: {
    alignSelf: 'stretch',
    gap: t.spacing.m,
    padding: t.spacing.m,
    borderRadius: t.borderRadius.large,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.7),
    border: `1px solid ${t.colors.white + t.colorOpacity(0.06)}`,
  },
  paletteGroup: {
    gap: t.spacing.s,
  },
  paletteGroupTitle: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.5,
    color: t.colors.dark05,
    textTransform: 'uppercase',
  },
  paletteItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: t.spacing.s,
  },
  paletteItem: {
    height: 34,
    padding: `0 ${t.spacing.m}px`,
    borderRadius: t.borderRadius.default,
    border: `1px solid ${t.colors.white + t.colorOpacity(0.08)}`,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.5),
    color: t.colors.white,
    cursor: 'pointer',
    fontSize: 13,
  },
}));
