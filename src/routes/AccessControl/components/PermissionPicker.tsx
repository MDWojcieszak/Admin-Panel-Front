import { PermissionGroupByResource } from '~/routes/AccessControl/hooks/usePermissionCatalog';
import { mkUseStyles, useTheme } from '~/utils/theme';

type PermissionPickerProps = {
  grouped: PermissionGroupByResource[];
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
};

export const PermissionPicker = ({ grouped, value, onChange, disabled }: PermissionPickerProps) => {
  const styles = useStyles();
  const theme = useTheme();
  const selected = new Set(value);

  const toggle = (key: string) => {
    if (disabled) return;
    const next = new Set(selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onChange(Array.from(next));
  };

  const toggleResource = (keys: string[], allSelected: boolean) => {
    if (disabled) return;
    const next = new Set(selected);
    keys.forEach((k) => (allSelected ? next.delete(k) : next.add(k)));
    onChange(Array.from(next));
  };

  return (
    <div style={styles.scroll}>
      <div style={styles.container}>
        {grouped.map((group) => {
          const keys = group.permissions.map((p) => p.key);
          const allSelected = keys.every((k) => selected.has(k));
          return (
            <div key={group.resource} style={styles.resourceBlock}>
              <div style={styles.resourceHeader} onClick={() => toggleResource(keys, allSelected)}>
                <span style={styles.resourceName}>{group.resource}</span>
                <span style={{ color: allSelected ? theme.colors.lightGreen : theme.colors.dark05 }}>
                  {allSelected ? 'all' : `${keys.filter((k) => selected.has(k)).length}/${keys.length}`}
                </span>
              </div>
              {group.permissions.map((descriptor) => {
                const isSelected = selected.has(descriptor.key);
                return (
                  <div
                    key={descriptor.key}
                    style={{
                      ...styles.permissionRow,
                      backgroundColor: isSelected
                        ? theme.colors.blue + theme.colorOpacity(0.18)
                        : theme.colors.gray04 + theme.colorOpacity(0.5),
                      opacity: disabled ? 0.5 : 1,
                      cursor: disabled ? 'not-allowed' : 'pointer',
                    }}
                    onClick={() => toggle(descriptor.key)}
                  >
                    <div
                      style={{
                        ...styles.checkbox,
                        backgroundColor: isSelected ? theme.colors.blue : 'transparent',
                        borderColor: isSelected ? theme.colors.blue : theme.colors.dark04,
                      }}
                    >
                      {isSelected ? '✓' : ''}
                    </div>
                    <div style={styles.permissionText}>
                      <span style={styles.permissionKey}>{descriptor.key}</span>
                      {descriptor.description ? (
                        <span style={styles.permissionDescription}>{descriptor.description}</span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  scroll: {
    maxHeight: 360,
    overflowY: 'auto',
    paddingRight: t.spacing.s,
  },
  container: {
    gap: t.spacing.m,
  },
  resourceBlock: {
    gap: t.spacing.s,
  },
  resourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    cursor: 'pointer',
    userSelect: 'none',
    paddingRight: t.spacing.s,
  },
  resourceName: {
    fontWeight: 700,
    textTransform: 'capitalize',
    color: t.colors.blue04,
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.m,
    padding: t.spacing.s,
    borderRadius: t.borderRadius.default,
  },
  checkbox: {
    width: 20,
    height: 20,
    minWidth: 20,
    borderRadius: t.borderRadius.default,
    border: `1px solid ${t.colors.dark04}`,
    alignItems: 'center',
    justifyContent: 'center',
    color: t.colors.white,
    fontSize: 13,
  },
  permissionText: {
    gap: 2,
  },
  permissionKey: {
    fontSize: 14,
  },
  permissionDescription: {
    fontSize: 12,
    color: t.colors.dark05,
  },
}));
