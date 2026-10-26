import { useState } from 'react';
import { FiInbox } from 'react-icons/fi';
import { Button } from '~/components/Button';
import { CreateTaskDto } from '~/api/api';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useApi } from '~/hooks/useApi';
import { useToast } from '~/hooks/useToast';
import { MainNavigationRoute, ProjectsNavigationRoute } from '~/navigation/types';
import { navigateTo } from '~/navigation/navigator';
import { QuickAdd } from '~/routes/Projects/components/QuickAdd';
import { useProjectStyles } from '~/routes/Projects/components/shared';
import { getApiErrorMessage } from '~/utils/apiError';
import { mkUseStyles, useTheme } from '~/utils/theme';

type QuickCaptureModalProps = Partial<InternalModalProps>;

/**
 * Write it down before it is gone: from anywhere in the panel, straight into
 * your inbox, to sort into a project later. Enter keeps the field open for
 * the next thought; pasting lines adds each one.
 */
export const QuickCaptureModal = (p: QuickCaptureModalProps) => {
  const styles = useStyles();
  const shared = useProjectStyles();
  const theme = useTheme();
  const toast = useToast();
  const { projectsApi } = useApi();
  const [inboxId, setInboxId] = useState<string>();
  const [added, setAdded] = useState<string[]>([]);

  const add = async (dto: CreateTaskDto) => {
    if (!projectsApi) return;
    try {
      let id = inboxId;
      if (!id) {
        const { data } = await projectsApi.projectControllerInbox();
        id = data.id;
        setInboxId(id);
      }
      await projectsApi.projectControllerCreateTask({ id, createTaskDto: dto });
      setAdded((prev) => [...prev, dto.title]);
    } catch (e) {
      toast(getApiErrorMessage(e, 'Could not add it to your inbox.'), 'error');
    }
  };

  const open = (path: string) => {
    p.handleClose?.();
    navigateTo(path);
  };

  return (
    <div style={styles.container}>
      <QuickAdd placeholder='What needs doing?' onAdd={add} autoFocus />
      <span style={styles.muted}>
        {added.length
          ? `In your inbox: ${added.slice(-3).join(', ')}${added.length > 3 ? ` and ${added.length - 3} more` : ''}.`
          : 'Enter adds it to your inbox and keeps the field for the next one. Sort it into a project later.'}
      </span>
      <div style={styles.footer}>
        <span style={{ ...shared.row, ...styles.muted }}>
          <FiInbox size={13} color={theme.colors.dark05} />
          {added.length ? `${added.length} added` : 'Inbox'}
        </span>
        <div style={shared.row}>
          {inboxId ? (
            <Button
              label='Open inbox'
              variant='secondary'
              onClick={() => open(`/${MainNavigationRoute.PROJECTS}/${inboxId}`)}
            />
          ) : null}
          <Button
            label='My work'
            variant='secondary'
            onClick={() => open(`/${MainNavigationRoute.PROJECTS}/${ProjectsNavigationRoute.MY_WORK}`)}
          />
        </div>
      </div>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: { gap: t.spacing.m, width: 'min(520px, 90vw)' },
  muted: { fontSize: 13, color: t.colors.dark05, lineHeight: 1.5 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.m,
    flexWrap: 'wrap',
  },
}));
