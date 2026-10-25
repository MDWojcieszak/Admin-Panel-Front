import { useEffect, useState } from 'react';
import { FiShoppingCart } from 'react-icons/fi';
import { ProjectRole, ProjectSummaryResponse, ProjectType } from '~/api/api';
import { Button } from '~/components/Button';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useApi } from '~/hooks/useApi';
import { useToast } from '~/hooks/useToast';
import { navigateTo } from '~/navigation/navigator';
import { PlainSelect, useProjectStyles } from '~/routes/Projects/components/shared';
import { projectPath } from '~/routes/Projects/utils';
import { getApiErrorMessage } from '~/utils/apiError';
import { mkUseStyles } from '~/utils/theme';

type ShoppingListModalProps = {
  projectId: string;
  projectTitle: string;
  /** Needed parts not on a list yet: what this would add. */
  count: number;
  onDone?: () => void;
} & Partial<InternalModalProps>;

const NEW_LIST = '';

/**
 * The parts still needed go onto a shopping list: a new one named after the
 * build, or one you already have (shared with whoever does the shopping).
 * Ticking a line off in the shop marks the part as at hand.
 */
export const ShoppingListModal = (p: ShoppingListModalProps) => {
  const styles = useStyles();
  const shared = useProjectStyles();
  const toast = useToast();
  const { projectsApi, buildsApi } = useApi();
  const [lists, setLists] = useState<ProjectSummaryResponse[]>([]);
  const [target, setTarget] = useState(NEW_LIST);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!projectsApi) return;
    projectsApi
      .projectControllerList({ archived: false, type: ProjectType.List })
      .then(({ data }) => setLists(data.filter((l) => l.role !== ProjectRole.Viewer)))
      .catch(() => setLists([]));
  }, [projectsApi]);

  const send = async (open: boolean) => {
    if (!buildsApi) return;
    setBusy(true);
    try {
      const { data } = await buildsApi.buildControllerToShoppingList({
        id: p.projectId,
        bomShoppingListDto: target ? { targetProjectId: target } : {},
      });
      toast(`${data.added} part${data.added === 1 ? '' : 's'} on the shopping list.`, 'success');
      p.onDone?.();
      p.handleClose?.();
      if (open) navigateTo(projectPath(data.projectId));
    } catch (e) {
      toast(getApiErrorMessage(e, 'Could not make the shopping list.'), 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={styles.container}>
      <span style={shared.muted}>
        {p.count} needed part{p.count === 1 ? '' : 's'} go{p.count === 1 ? 'es' : ''} onto the list, with quantity and
        unit. Ticking one off in the shop marks the part as at hand.
      </span>
      <PlainSelect
        label='List'
        value={target}
        options={[
          { value: NEW_LIST, label: `A new list: Shopping: ${p.projectTitle}` },
          ...lists.map((l) => ({ value: l.id, label: l.title })),
        ]}
        onChange={setTarget}
      />
      <div style={styles.actions}>
        <Button
          label='Add and open the list'
          icon={<FiShoppingCart size={14} />}
          loading={busy}
          onClick={() => send(true)}
        />
        <Button label='Just add' variant='secondary' disabled={busy} onClick={() => send(false)} />
      </div>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: { gap: t.spacing.m, width: 'min(480px, 90vw)' },
  actions: { flexDirection: 'row', gap: t.spacing.s, flexWrap: 'wrap' },
}));
