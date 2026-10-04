import { format } from 'date-fns';
import { AuditEntryResponse } from '~/api/api';
import { Loader } from '~/components/Loader';
import { useApi } from '~/hooks/useApi';
import { useAsync } from '~/hooks/useAsync';
import { Section, useDeployStyles } from '~/routes/Deploy/components/shared';
import { mkUseStyles } from '~/utils/theme';

type Change = { from?: unknown; to?: unknown };

const show = (value: unknown) =>
  value === null || value === undefined ? '∅' : typeof value === 'string' ? value : JSON.stringify(value);

/** Who changed what, with secrets already redacted by the backend. */
export const ActivityTab = ({ applicationId }: { applicationId: string }) => {
  const styles = useStyles();
  const shared = useDeployStyles();
  const { deployApi } = useApi();

  const query = useAsync<AuditEntryResponse[]>(async () => {
    if (!deployApi) return undefined;
    const { data } = await deployApi.deployControllerListAudit({
      entityType: 'Application',
      entityId: applicationId,
      take: 100,
    });
    return data;
  }, [deployApi, applicationId]);

  const entries = query.data ?? [];

  return (
    <Section title='Activity'>
      {query.loading && !query.data ? (
        <Loader />
      ) : entries.length === 0 ? (
        <div style={shared.emptyRow}>No recorded changes.</div>
      ) : (
        <div style={shared.list}>
          {entries.map((entry) => {
            const actor = entry.actor
              ? [entry.actor.firstName, entry.actor.lastName].filter(Boolean).join(' ') || entry.actor.email
              : entry.source.toLowerCase();
            const changes = Object.entries((entry.diff ?? {}) as Record<string, Change>);
            return (
              <div key={entry.id} style={{ ...shared.listRow, alignItems: 'flex-start' }}>
                <div style={styles.main}>
                  <div style={shared.row}>
                    <span style={{ ...styles.action, ...shared.mono }}>{entry.action}</span>
                    <span style={shared.muted}>by {actor}</span>
                  </div>
                  {changes.map(([field, change]) => (
                    <span key={field} style={{ ...shared.muted, ...shared.mono, ...styles.change }}>
                      {field}: {show(change?.from)} → {show(change?.to)}
                    </span>
                  ))}
                </div>
                <span style={shared.muted}>{format(new Date(entry.createdAt), 'd MMM yyyy, HH:mm')}</span>
              </div>
            );
          })}
        </div>
      )}
    </Section>
  );
};

const useStyles = mkUseStyles((t) => ({
  main: { flex: 1, minWidth: 0, gap: 2 },
  action: { fontSize: 13, fontWeight: 700, color: t.colors.white },
  change: { whiteSpace: 'pre-wrap', wordBreak: 'break-all' },
}));
