import { useMemo, useState } from 'react';
import { MdGroups, MdVpnKey } from 'react-icons/md';
import { SegmentedTabs } from '~/components/SegmentedTabs';
import { useCan } from '~/hooks/usePermissions';
import { GroupsPanel } from '~/routes/AccessControl/components/GroupsPanel';
import { UserAccessPanel } from '~/routes/AccessControl/components/UserAccessPanel';
import { mkUseStyles } from '~/utils/theme';

type Tab = 'groups' | 'users';

export const AccessControl = () => {
  const styles = useStyles();
  const can = useCan();
  const canManage = can('acl.manage');
  const canAssign = can('acl.assign');

  const tabs = useMemo(() => {
    const items: { label: string; value: Tab; icon: JSX.Element }[] = [];
    if (canManage) items.push({ label: 'Permission Groups', value: 'groups', icon: <MdVpnKey size={20} /> });
    if (canAssign) items.push({ label: 'User Access', value: 'users', icon: <MdGroups size={20} /> });
    return items;
  }, [canManage, canAssign]);

  const [selected, setSelected] = useState<Tab>(canManage ? 'groups' : 'users');

  return (
    <div style={styles.container}>
      {tabs.length > 1 ? (
        <SegmentedTabs
          layoutId='acl-tabs'
          items={tabs}
          selected={selected}
          handleSelect={(value) => setSelected(value as Tab)}
        />
      ) : null}
      <div style={styles.content}>
        {selected === 'groups' && canManage ? <GroupsPanel /> : null}
        {selected === 'users' && canAssign ? <UserAccessPanel /> : null}
      </div>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    height: '100%',
    minHeight: 0,
    gap: t.spacing.l,
  },
  content: {
    flex: 1,
    minHeight: 0,
    display: 'flex',
  },
}));
