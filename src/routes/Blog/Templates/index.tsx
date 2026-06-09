import { FaPlus } from 'react-icons/fa6';
import { MdDashboardCustomize, MdDelete, MdEdit } from 'react-icons/md';
import { Badge } from '~/components/Badge';
import { Button } from '~/components/Button';
import { EmptyState } from '~/components/EmptyState';
import { Scrollbar } from '~/components/Scrollbar';
import { useApi } from '~/hooks/useApi';
import { useCan } from '~/hooks/usePermissions';
import { useModal } from '~/hooks/useModal';
import { useTemplates } from '~/routes/Blog/Templates/hooks/useTemplates';
import { TemplateEditorModal } from '~/routes/Blog/Templates/modals/TemplateEditorModal';
import { mkUseStyles, useTheme } from '~/utils/theme';

export const BlogTemplates = () => {
  const styles = useStyles();
  const theme = useTheme();
  const { blogTemplatesApi } = useApi();
  const can = useCan();
  const canManage = can('blog.write');

  const { templates, refresh } = useTemplates();

  const editor = useModal(
    'blog-template-editor',
    TemplateEditorModal,
    { title: 'Section template' },
    {
      handleClose: async () => {
        editor.hide();
        refresh();
      },
    },
  );

  const handleDelete = async (id: string) => {
    if (!blogTemplatesApi || !canManage) return;
    try {
      await blogTemplatesApi.templateControllerDelete({ id });
      refresh();
    } catch (e) {
      console.error('Error deleting template:', e);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.toolbar}>
        <h2 style={styles.title}>Section templates</h2>
        {canManage ? (
          <Button label='New template' icon={<FaPlus />} onClick={() => editor.show({ canManage, template: undefined })} />
        ) : null}
      </div>

      <div style={styles.listWrap}>
        <Scrollbar style={styles.scroll}>
          {templates.length === 0 ? (
            <EmptyState
              icon={<MdDashboardCustomize size={26} color={theme.colors.blue04} />}
              title='No templates yet'
              description='Create a section preset to speed up writing posts.'
            />
          ) : (
            <div style={styles.list}>
              {templates.map((tpl) => (
                <div key={tpl.id} style={styles.row}>
                  <div style={styles.info}>
                    <span style={styles.name}>{tpl.name}</span>
                    <span style={styles.meta}>
                      {[tpl.group, `${tpl.blocks.length} block(s)`].filter(Boolean).join(' · ')}
                    </span>
                  </div>
                  {tpl.isSystem ? <Badge label='system' tone='neutral' /> : null}
                  {canManage ? (
                    <div style={styles.actions}>
                      <button style={styles.iconBtn} title='Edit' onClick={() => editor.show({ template: tpl, canManage })}>
                        <MdEdit size={18} color={theme.colors.blue04} />
                      </button>
                      {!tpl.isSystem ? (
                        <button style={styles.iconBtn} title='Delete' onClick={() => handleDelete(tpl.id)}>
                          <MdDelete size={18} color={theme.colors.red} />
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </Scrollbar>
      </div>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: { height: '100%', minHeight: 0, gap: t.spacing.m },
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.spacing.m },
  title: { fontSize: 22, fontWeight: 700 },
  listWrap: { flex: 1, minHeight: 0, position: 'relative' },
  scroll: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  list: { gap: t.spacing.s, paddingRight: t.spacing.m },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.m,
    padding: t.spacing.m,
    borderRadius: t.borderRadius.large,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.5),
    border: `1px solid ${t.colors.white + t.colorOpacity(0.05)}`,
  },
  info: { flex: 1, minWidth: 0, gap: 2 },
  name: { fontWeight: 600 },
  meta: { fontSize: 12, color: t.colors.dark05 },
  actions: { flexDirection: 'row', gap: 2 },
  iconBtn: {
    width: 32,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.borderRadius.small,
    border: 0,
    background: 'transparent',
    cursor: 'pointer',
  },
}));
