import { useState } from 'react';
import { FiRefreshCw, FiHardDrive } from 'react-icons/fi';
import { ImmichLibraryListResponse } from '~/api/api';
import { Button } from '~/components/Button';
import { Loader } from '~/components/Loader';
import { useApi } from '~/hooks/useApi';
import { useAsync } from '~/hooks/useAsync';
import { useCan } from '~/hooks/usePermissions';
import { useToast } from '~/hooks/useToast';
import { getApiErrorMessage } from '~/utils/apiError';
import { mkUseStyles, useTheme } from '~/utils/theme';

const humanBytes = (bytes?: number): string => {
  if (!bytes || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${(bytes / Math.pow(1024, i)).toFixed(i ? 1 : 0)} ${units[i]}`;
};

export const ImmichLibraries = () => {
  const styles = useStyles();
  const theme = useTheme();
  const { immichApi } = useApi();
  const toast = useToast();
  const can = useCan();
  const canManage = can('photoEntry.manage');

  const [scanningId, setScanningId] = useState<string>();

  const librariesQuery = useAsync<ImmichLibraryListResponse>(async () => {
    if (!immichApi) return undefined;
    const { data } = await immichApi.immichControllerListLibraries();
    return data;
  }, [immichApi]);

  const scan = async (id: string) => {
    if (!immichApi) return;
    setScanningId(id);
    try {
      await immichApi.immichControllerScanLibrary({ id });
      toast('Scan scheduled — refresh in a moment to see updated counts.', 'success');
    } catch (e) {
      toast(getApiErrorMessage(e, 'Could not start the scan.'), 'error');
    } finally {
      setScanningId(undefined);
    }
  };

  const libraries = librariesQuery.data?.libraries ?? [];

  return (
    <div style={styles.block}>
      <div style={styles.blockHeader}>
        <div style={styles.titleWrap}>
          <div style={styles.iconWrap}>
            <FiHardDrive size={16} color={theme.colors.blue04} />
          </div>
          <span style={styles.blockTitle}>Libraries</span>
        </div>
        <Button
          label='Refresh'
          variant='secondary'
          icon={<FiRefreshCw size={14} />}
          onClick={() => librariesQuery.reload()}
          loading={librariesQuery.loading}
        />
      </div>

      {librariesQuery.loading && !librariesQuery.data ? (
        <Loader />
      ) : libraries.length === 0 ? (
        <span style={styles.muted}>No external libraries reported by Immich.</span>
      ) : (
        <div style={styles.list}>
          {libraries.map((lib) => (
            <div key={lib.id} style={styles.row}>
              <div style={styles.info}>
                <span style={styles.name}>{lib.name}</span>
                <span style={styles.meta}>
                  {lib.photos} photos · {lib.videos} videos · {humanBytes(lib.usage)}
                </span>
                {lib.importPaths?.length ? (
                  <span style={styles.paths} title={lib.importPaths.join('\n')}>
                    {lib.importPaths.join(' · ')}
                  </span>
                ) : null}
                {lib.exclusionPatterns?.length ? (
                  <span style={styles.exclusions}>Excludes: {lib.exclusionPatterns.join(', ')}</span>
                ) : null}
              </div>
              {canManage ? (
                <Button
                  label='Scan'
                  variant='secondary'
                  icon={<FiRefreshCw size={13} />}
                  onClick={() => scan(lib.id)}
                  loading={scanningId === lib.id}
                />
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  block: {
    gap: t.spacing.m,
    backgroundColor: t.colors.gray03 + t.colorOpacity(0.7),
    padding: t.spacing.m,
    borderRadius: t.borderRadius.large,
  },
  blockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.m,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
  },
  iconWrap: {
    width: 34,
    height: 34,
    minWidth: 34,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.colors.blue + t.colorOpacity(0.12),
    border: `1px solid ${t.colors.blue + t.colorOpacity(0.22)}`,
  },
  blockTitle: {
    fontWeight: 700,
    fontSize: 16,
  },
  list: {
    gap: t.spacing.s,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.m,
    padding: t.spacing.s,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.5),
  },
  info: {
    gap: 3,
    minWidth: 0,
    flex: 1,
  },
  name: {
    fontWeight: 600,
  },
  meta: {
    fontSize: 12,
    color: t.colors.dark05,
  },
  paths: {
    fontSize: 11,
    color: t.colors.dark05,
    wordBreak: 'break-all',
  },
  exclusions: {
    fontSize: 11,
    color: t.colors.yellow,
  },
  muted: {
    fontSize: 13,
    color: t.colors.dark05,
  },
}));
