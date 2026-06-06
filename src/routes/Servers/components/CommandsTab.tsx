import { useState } from 'react';
import { FaPlus } from 'react-icons/fa6';
import { MdEdit, MdKeyboardCommandKey } from 'react-icons/md';
import { ServerCategoriesDto } from '~/api/api';
import { Button } from '~/components/Button';
import { SegmentedTabs } from '~/components/SegmentedTabs';
import { useCan } from '~/hooks/usePermissions';
import { useModal } from '~/hooks/useModal';
import { CommandCard } from '~/routes/Servers/components/CommandCard';
import { SettingsPanel } from '~/routes/Servers/components/SettingsPanel';
import { TransfersPanel } from '~/routes/Servers/components/TransfersPanel';
import { CategoryModal } from '~/routes/Servers/modals/CategoryModal';
import { mkUseStyles } from '~/utils/theme';

type CommandsTabProps = {
  serverId?: string;
  categories: ServerCategoriesDto[];
  serverOnline?: boolean;
  onCategoryChanged: F0;
  onCommandRun?: (commandId: string, name: string) => void;
};

export const CommandsTab = ({
  serverId,
  categories,
  serverOnline,
  onCategoryChanged,
  onCommandRun,
}: CommandsTabProps) => {
  const styles = useStyles();
  const can = useCan();
  const canManageCategory = can('server.category.manage');
  const canReadTransfer = can('transfer.read');
  const canReadSettings = can('settings.read');

  const [selected, setSelected] = useState<string>();
  const selectedValue = selected ?? categories[0]?.value;
  const selectedCategory = categories.find((c) => c.value === selectedValue);

  const categoryModal = useModal(
    'server-category',
    CategoryModal,
    { title: 'Category' },
    {
      handleClose: async () => {
        onCategoryChanged();
        categoryModal.hide();
      },
    },
  );

  const tabItems = categories.map((c) => ({
    label: c.name || c.value,
    value: c.value,
    icon: <MdKeyboardCommandKey size={18} />,
  }));

  return (
    <div style={styles.container}>
      <div style={styles.toolbar}>
        {tabItems.length ? (
          <SegmentedTabs layoutId='category-tabs' items={tabItems} selected={selectedValue ?? ''} handleSelect={setSelected} />
        ) : (
          <span style={styles.empty}>No categories yet.</span>
        )}
        {canManageCategory ? (
          <div style={styles.toolbarActions}>
            {selectedCategory ? (
              <Button
                label='Rename'
                icon={<MdEdit size={16} />}
                variant='secondary'
                onClick={() => categoryModal.show({ category: selectedCategory, serverId: undefined, canManage: canManageCategory })}
              />
            ) : null}
            <Button
              label='Add category'
              icon={<FaPlus />}
              variant='secondary'
              onClick={() => categoryModal.show({ serverId, canManage: canManageCategory, category: undefined })}
            />
          </div>
        ) : null}
      </div>

      {selectedCategory ? (
        <div style={styles.content}>
          <CommandCard categoryId={selectedCategory.id} serverOnline={serverOnline} onCommandRun={onCommandRun} />
          {canReadSettings ? (
            <div style={styles.section}>
              <span style={styles.sectionHeading}>Settings</span>
              <SettingsPanel serverId={serverId} categoryId={selectedCategory.id} />
            </div>
          ) : null}
          {canReadTransfer ? <TransfersPanel categoryId={selectedCategory.id} /> : null}
        </div>
      ) : null}
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    gap: t.spacing.l,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: t.spacing.m,
  },
  toolbarActions: {
    flexDirection: 'row',
    gap: t.spacing.s,
  },
  content: {
    gap: t.spacing.m,
  },
  section: {
    gap: t.spacing.m,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.7),
    padding: t.spacing.m,
    borderRadius: t.borderRadius.default,
  },
  sectionHeading: {
    fontWeight: 600,
  },
  empty: {
    color: t.colors.dark05,
  },
}));
