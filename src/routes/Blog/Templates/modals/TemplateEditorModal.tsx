import { useCallback, useEffect, useState } from 'react';
import { MdAdd, MdArrowDownward, MdArrowUpward, MdDelete } from 'react-icons/md';
import { BlogSectionType, TemplateBlockResponse, TemplateResponse } from '~/api/api';
import { Button } from '~/components/Button';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useApi } from '~/hooks/useApi';
import { SECTION_META } from '~/routes/Blog/Editor/sectionTypes';
import { mkUseStyles, useTheme } from '~/utils/theme';

type TemplateEditorModalProps = {
  template?: TemplateResponse;
  canManage?: boolean;
} & Partial<InternalModalProps>;

export const TemplateEditorModal = (p: TemplateEditorModalProps) => {
  const styles = useStyles();
  const { blogTemplatesApi } = useApi();
  const isEdit = Boolean(p.template);
  const isSystem = p.template?.isSystem ?? false;
  const canManage = p.canManage ?? true;
  const [saving, setSaving] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const [key, setKey] = useState(p.template?.key ?? '');
  const [name, setName] = useState(p.template?.name ?? '');
  const [group, setGroup] = useState(p.template?.group ?? '');
  const [description, setDescription] = useState(p.template?.description ?? '');
  const [blocks, setBlocks] = useState<TemplateBlockResponse[]>(p.template?.blocks ?? []);

  const reload = useCallback(async () => {
    if (!blogTemplatesApi || !p.template) return;
    try {
      const { data } = await blogTemplatesApi.templateControllerGet({ id: p.template.id });
      setBlocks([...data.blocks].sort((a, b) => a.order - b.order));
    } catch (e) {
      console.error('Error loading template:', e);
    }
  }, [blogTemplatesApi, p.template]);

  useEffect(() => {
    if (isEdit) reload();
  }, [isEdit, reload]);

  const saveMeta = async () => {
    if (!blogTemplatesApi || !canManage || !name.trim()) return;
    setSaving(true);
    try {
      if (isEdit && p.template) {
        await blogTemplatesApi.templateControllerPatch({
          id: p.template.id,
          patchTemplateDto: { name, group: group || null, description: description || null },
        });
      } else {
        await blogTemplatesApi.templateControllerCreate({
          createTemplateDto: { key: key.trim(), name, group: group || null, description: description || null },
        });
      }
      p.handleClose?.();
    } catch (e) {
      console.error('Error saving template:', e);
    } finally {
      setSaving(false);
    }
  };

  const addBlock = async (type: BlogSectionType) => {
    if (!blogTemplatesApi || !p.template) return;
    setPaletteOpen(false);
    const order = blocks.length ? Math.max(...blocks.map((b) => b.order)) + 1 : 0;
    try {
      await blogTemplatesApi.templateControllerAddBlock({ id: p.template.id, createTemplateBlockDto: { type, order } });
      reload();
    } catch (e) {
      console.error('Error adding block:', e);
    }
  };

  const patchBlock = async (blockId: string, placeholderTitle: string, placeholderBody: string) => {
    if (!blogTemplatesApi || !p.template) return;
    try {
      await blogTemplatesApi.templateControllerPatchBlock({
        templateId: p.template.id,
        blockId,
        patchTemplateBlockDto: { placeholderTitle: placeholderTitle || undefined, placeholderBody: placeholderBody || undefined },
      });
    } catch (e) {
      console.error('Error patching block:', e);
    }
  };

  const deleteBlock = async (blockId: string) => {
    if (!blogTemplatesApi || !p.template) return;
    try {
      await blogTemplatesApi.templateControllerDeleteBlock({ templateId: p.template.id, blockId });
      reload();
    } catch (e) {
      console.error('Error deleting block:', e);
    }
  };

  const moveBlock = async (blockId: string, dir: -1 | 1) => {
    if (!blogTemplatesApi || !p.template) return;
    const idx = blocks.findIndex((b) => b.id === blockId);
    const swap = idx + dir;
    if (idx < 0 || swap < 0 || swap >= blocks.length) return;
    const next = [...blocks];
    [next[idx], next[swap]] = [next[swap], next[idx]];
    setBlocks(next);
    try {
      await blogTemplatesApi.templateControllerReorderBlocks({
        templateId: p.template.id,
        reorderDto: { items: next.map((b, i) => ({ id: b.id, order: i })) },
      });
    } catch (e) {
      console.error('Error reordering blocks:', e);
      reload();
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.row}>
        <div style={styles.field}>
          <span style={styles.label}>Name</span>
          <input style={styles.input} value={name} onChange={(e) => setName(e.target.value)} placeholder='Travel guide' />
        </div>
        <div style={styles.field}>
          <span style={styles.label}>Key</span>
          <input
            style={styles.input}
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder='travel-guide'
            disabled={isEdit}
          />
        </div>
      </div>
      <div style={styles.row}>
        <div style={styles.field}>
          <span style={styles.label}>Group</span>
          <input style={styles.input} value={group} onChange={(e) => setGroup(e.target.value)} placeholder='Optional' />
        </div>
        <div style={styles.field}>
          <span style={styles.label}>Description</span>
          <input style={styles.input} value={description} onChange={(e) => setDescription(e.target.value)} placeholder='Optional' />
        </div>
      </div>

      {isEdit && p.template ? (
        <div style={styles.blocksSection}>
          <span style={styles.label}>Blocks</span>
          {blocks.map((b, i) => (
            <TemplateBlockRow
              key={b.id}
              block={b}
              isFirst={i === 0}
              isLast={i === blocks.length - 1}
              onSave={patchBlock}
              onMove={moveBlock}
              onDelete={deleteBlock}
            />
          ))}
          <div style={styles.addArea}>
            <button style={styles.addButton} onClick={() => setPaletteOpen((o) => !o)}>
              <MdAdd size={16} /> Add block
            </button>
            {paletteOpen ? (
              <div style={styles.palette}>
                {SECTION_META.map((m) => (
                  <button key={m.type} style={styles.paletteItem} onClick={() => addBlock(m.type)}>
                    {m.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <span style={styles.editHint}>Create the template first, then reopen it to add blocks.</span>
      )}

      {isSystem ? <span style={styles.systemNote}>System template — managed in code.</span> : null}

      <Button label={isEdit ? 'Save template' : 'Create template'} onClick={saveMeta} loading={saving} disabled={!canManage} />
    </div>
  );
};

const TemplateBlockRow = ({
  block,
  isFirst,
  isLast,
  onSave,
  onMove,
  onDelete,
}: {
  block: TemplateBlockResponse;
  isFirst: boolean;
  isLast: boolean;
  onSave: (blockId: string, title: string, body: string) => void;
  onMove: (blockId: string, dir: -1 | 1) => void;
  onDelete: (blockId: string) => void;
}) => {
  const styles = useStyles();
  const theme = useTheme();
  const [title, setTitle] = useState(block.placeholderTitle ?? '');
  const [body, setBody] = useState(block.placeholderBody ?? '');

  return (
    <div style={styles.block}>
      <div style={styles.blockHead}>
        <span style={styles.blockType}>{block.type}</span>
        <div style={styles.blockActions}>
          <button style={styles.iconBtn} disabled={isFirst} onClick={() => onMove(block.id, -1)}>
            <MdArrowUpward size={15} color={isFirst ? theme.colors.dark04 : theme.colors.white} />
          </button>
          <button style={styles.iconBtn} disabled={isLast} onClick={() => onMove(block.id, 1)}>
            <MdArrowDownward size={15} color={isLast ? theme.colors.dark04 : theme.colors.white} />
          </button>
          <button style={styles.iconBtn} onClick={() => onDelete(block.id)}>
            <MdDelete size={15} color={theme.colors.red} />
          </button>
        </div>
      </div>
      <input
        style={styles.smallInput}
        placeholder='Placeholder title'
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => onSave(block.id, title, body)}
      />
      <input
        style={styles.smallInput}
        placeholder='Placeholder body'
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onBlur={() => onSave(block.id, title, body)}
      />
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: { gap: t.spacing.s, width: 520, maxHeight: '76vh', overflowY: 'auto', paddingRight: t.spacing.s },
  row: { flexDirection: 'row', gap: t.spacing.m },
  field: { flex: 1, minWidth: 0, gap: t.spacing.xs },
  label: { fontSize: 12, fontWeight: 600, color: t.colors.blue04 },
  input: {
    height: 38,
    boxSizing: 'border-box',
    padding: `0 ${t.spacing.m}px`,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
    color: t.colors.white,
    border: 0,
    outline: 'none',
    fontSize: 14,
  },
  blocksSection: { gap: t.spacing.s, paddingTop: t.spacing.m, borderTop: `1px solid ${t.colors.white + t.colorOpacity(0.06)}` },
  block: {
    gap: t.spacing.xs,
    padding: t.spacing.s,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.5),
  },
  blockHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  blockType: { fontSize: 11, fontWeight: 700, letterSpacing: 0.5, color: t.colors.blue04 },
  blockActions: { flexDirection: 'row', gap: 2 },
  iconBtn: {
    width: 26,
    height: 26,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.borderRadius.small,
    border: 0,
    background: 'transparent',
    cursor: 'pointer',
  },
  smallInput: {
    height: 32,
    boxSizing: 'border-box',
    padding: `0 ${t.spacing.s}px`,
    borderRadius: t.borderRadius.small,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
    color: t.colors.white,
    border: 0,
    outline: 'none',
    fontSize: 13,
  },
  addArea: { gap: t.spacing.s, alignItems: 'flex-start' },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.xs,
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
  palette: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.xs },
  paletteItem: {
    height: 30,
    padding: `0 ${t.spacing.s}px`,
    borderRadius: t.borderRadius.default,
    border: `1px solid ${t.colors.white + t.colorOpacity(0.08)}`,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.5),
    color: t.colors.white,
    cursor: 'pointer',
    fontSize: 12,
  },
  editHint: { fontSize: 12, color: t.colors.dark05, paddingTop: t.spacing.s },
  systemNote: { fontSize: 12, color: t.colors.yellow },
}));
