import { useEffect, useState } from 'react';
import { MdEdit, MdSave } from 'react-icons/md';
import { ServerSettingsResponseDto, SettingType } from '~/api/api';
import { Loader } from '~/components/Loader';
import { useCan } from '~/hooks/usePermissions';
import { useModal } from '~/hooks/useModal';
import { useSettings } from '~/routes/Servers/hooks/useSettings';
import { SettingEditModal } from '~/routes/Servers/modals/SettingEditModal';
import { mkUseStyles } from '~/utils/theme';

type SettingsPanelProps = {
  serverId?: string;
  categoryId?: string;
};

const SettingRow = ({
  setting,
  canManage,
  onSave,
  onEditName,
}: {
  setting: ServerSettingsResponseDto;
  canManage: boolean;
  onSave: (value: string) => Promise<void>;
  onEditName: () => void;
}) => {
  const styles = useStyles();
  const [value, setValue] = useState(setting.value);
  const [saving, setSaving] = useState(false);

  useEffect(() => setValue(setting.value), [setting.value]);

  const dirty = value !== setting.value;

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(value);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.row}>
      <div style={styles.meta}>
        <span style={styles.name}>{setting.name || setting.serverName}</span>
        <span style={styles.category}>
          {setting.serverName} · {setting.serverCategory?.name} · {setting.type}
        </span>
      </div>
      {canManage ? (
        <div style={styles.iconButton} onClick={onEditName} title='Edit display name'>
          <MdEdit size={18} />
        </div>
      ) : null}
      <input
        style={styles.input}
        value={value}
        disabled={!canManage}
        placeholder='Value'
        type={setting.type === SettingType.Number ? 'number' : 'text'}
        onChange={(e) => setValue(e.target.value)}
      />
      {canManage ? (
        <div
          style={{ ...styles.saveButton, opacity: dirty && !saving ? 1 : 0.4, cursor: dirty ? 'pointer' : 'default' }}
          onClick={() => (dirty && !saving ? handleSave() : undefined)}
        >
          <MdSave size={18} />
        </div>
      ) : null}
    </div>
  );
};

export const SettingsPanel = ({ serverId, categoryId }: SettingsPanelProps) => {
  const styles = useStyles();
  const can = useCan();
  const canManage = can('settings.manage');
  const { settings, loading, updateSetting, refresh } = useSettings(serverId, categoryId);
  const list = settings ?? [];

  const editModal = useModal(
    'setting-edit',
    SettingEditModal,
    { title: 'Edit setting' },
    {
      handleClose: async () => {
        refresh();
        editModal.hide();
      },
    },
  );

  if (loading && list.length === 0) return <Loader />;
  if (list.length === 0) return <div style={styles.empty}>No settings for this scope.</div>;

  return (
    <div style={styles.container}>
      {list.map((setting) => (
        <SettingRow
          key={setting.id}
          setting={setting}
          canManage={canManage}
          onSave={(value) => updateSetting(setting.id, setting.name ?? '', value)}
          onEditName={() =>
            editModal.show({
              settingId: setting.id,
              settingName: setting.name ?? '',
              serverName: setting.serverName,
              canManage,
            })
          }
        />
      ))}
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    gap: t.spacing.s,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.m,
    padding: t.spacing.m,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray03 + t.colorOpacity(0.6),
  },
  meta: {
    gap: 2,
    flex: 1,
  },
  name: {
    fontWeight: 600,
  },
  category: {
    fontSize: 12,
    color: t.colors.dark05,
  },
  iconButton: {
    backgroundColor: t.colors.gray05,
    padding: t.spacing.s,
    borderRadius: t.borderRadius.default,
    cursor: 'pointer',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    minWidth: 0,
    padding: t.spacing.s,
    color: t.colors.white,
    fontSize: 14,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
    border: 0,
    outline: 'none',
  },
  saveButton: {
    backgroundColor: t.colors.gray05,
    padding: t.spacing.s,
    borderRadius: t.borderRadius.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    color: t.colors.dark05,
    padding: t.spacing.m,
  },
}));
