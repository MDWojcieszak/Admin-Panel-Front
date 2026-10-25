import { useEffect, useState } from 'react';
import { FiLogOut, FiX } from 'react-icons/fi';
import { ProjectDetailResponse, ProjectRole } from '~/api/api';
import { Badge } from '~/components/Badge';
import { Button } from '~/components/Button';
import { Loader } from '~/components/Loader';
import { Switch } from '~/components/Switch';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useApi } from '~/hooks/useApi';
import { useAuth } from '~/hooks/useAuth';
import { useToast } from '~/hooks/useToast';
import { Avatar, PlainSelect, useProjectStyles } from '~/routes/Projects/components/shared';
import { ROLE_LABEL, ROLE_TONE, userName } from '~/routes/Projects/utils';
import { getApiErrorMessage } from '~/utils/apiError';
import { mkUseStyles } from '~/utils/theme';

type ShareModalProps = {
  projectId: string;
  /** After leaving, the project is gone from your list. */
  onLeft?: () => void;
} & Partial<InternalModalProps>;

const ROLE_OPTIONS = [
  { value: ProjectRole.Editor, label: 'Editor — adds and changes tasks' },
  { value: ProjectRole.Viewer, label: 'Viewer — sees the project' },
];

/** Who the project is shared with (D2, D4): invited by their account's exact e-mail. */
export const ShareModal = (p: ShareModalProps) => {
  const styles = useStyles();
  const shared = useProjectStyles();
  const { projectsApi } = useApi();
  const { userData } = useAuth();
  const toast = useToast();
  const [project, setProject] = useState<ProjectDetailResponse>();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<ProjectRole>(ProjectRole.Editor);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!projectsApi) return;
    const { data } = await projectsApi.projectControllerGet({ id: p.projectId });
    setProject(data);
  };

  useEffect(() => {
    load().catch((e) => toast(getApiErrorMessage(e, 'Could not load the project.'), 'error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectsApi, p.projectId]);

  if (!project) return <Loader />;

  const owns = project.role === ProjectRole.Owner;

  const run = async (action: () => Promise<unknown>, failure: string) => {
    setBusy(true);
    try {
      await action();
      await load();
      return true;
    } catch (e) {
      toast(getApiErrorMessage(e, failure), 'error');
      return false;
    } finally {
      setBusy(false);
    }
  };

  const invite = async () => {
    if (!projectsApi || !email.trim()) return;
    const ok = await run(
      () =>
        projectsApi.projectControllerAddMember({
          id: project.id,
          addProjectMemberDto: { email: email.trim(), role },
        }),
      'Could not share the project.',
    );
    if (ok) setEmail('');
  };

  return (
    <div style={styles.container}>
      {owns ? (
        <div style={styles.invite}>
          <span style={shared.fieldLabel}>Invite by e-mail</span>
          <input
            style={shared.textInput}
            type='email'
            value={email}
            placeholder='Their account e-mail'
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && invite()}
          />
          <div style={{ ...shared.row, flexWrap: 'nowrap' }}>
            <PlainSelect value={role} options={ROLE_OPTIONS} onChange={(v) => setRole(v as ProjectRole)} />
            <Button label='Share' onClick={invite} loading={busy} disabled={!email.trim()} />
          </div>
          <span style={shared.muted}>They need an account here; the project shows up in their list right away.</span>
        </div>
      ) : null}

      <div style={styles.section}>
        <span style={shared.fieldLabel}>People</span>
        <div style={shared.list}>
          <div style={shared.listRow}>
            <Avatar user={project.owner} size={30} />
            <PersonLabel name={userName(project.owner)} email={project.owner.email} />
            <Badge label='Owner' tone={ROLE_TONE.OWNER} />
          </div>
          {project.members.map((member) => {
            const isMe = member.user.id === userData?.id;
            return (
              <div key={member.user.id} style={shared.listRow}>
                <Avatar user={member.user} size={30} />
                <PersonLabel name={userName(member.user)} email={member.user.email} />
                {owns ? (
                  <>
                    <PlainSelect
                      value={member.role}
                      style={styles.roleSelect}
                      options={[
                        { value: ProjectRole.Editor, label: 'Editor' },
                        { value: ProjectRole.Viewer, label: 'Viewer' },
                      ]}
                      onChange={(value) =>
                        run(
                          () =>
                            projectsApi
                              ? projectsApi.projectControllerUpdateMember({
                                  id: project.id,
                                  userId: member.user.id,
                                  updateProjectMemberDto: { role: value as ProjectRole },
                                })
                              : Promise.resolve(),
                          'Could not change the role.',
                        )
                      }
                    />
                    <button
                      type='button'
                      title='Remove from the project'
                      style={shared.iconButton}
                      onClick={() =>
                        run(
                          () =>
                            projectsApi
                              ? projectsApi.projectControllerRemoveMember({ id: project.id, userId: member.user.id })
                              : Promise.resolve(),
                          'Could not remove them.',
                        )
                      }
                    >
                      <FiX size={15} />
                    </button>
                  </>
                ) : (
                  <Badge
                    label={isMe ? `${ROLE_LABEL[member.role]} · you` : ROLE_LABEL[member.role]}
                    tone={ROLE_TONE[member.role]}
                  />
                )}
              </div>
            );
          })}
        </div>
        {project.members.length === 0 ? <span style={shared.muted}>Only you, so far.</span> : null}
      </div>

      {owns ? (
        <Switch
          checked={project.viewersCanCheck}
          label='Viewers can tick tasks off'
          onChange={(viewersCanCheck) =>
            run(
              () =>
                projectsApi
                  ? projectsApi.projectControllerUpdate({ id: project.id, updateProjectDto: { viewersCanCheck } })
                  : Promise.resolve(),
              'Could not save.',
            )
          }
        />
      ) : (
        <Button
          label='Leave project'
          variant='secondary'
          icon={<FiLogOut size={14} />}
          loading={busy}
          onClick={async () => {
            if (!projectsApi || !userData?.id) return;
            try {
              await projectsApi.projectControllerRemoveMember({ id: project.id, userId: userData.id });
              p.handleClose?.();
              p.onLeft?.();
            } catch (e) {
              toast(getApiErrorMessage(e, 'Could not leave the project.'), 'error');
            }
          }}
        />
      )}
    </div>
  );
};

const PersonLabel = ({ name, email }: { name: string; email: string }) => {
  const shared = useProjectStyles();
  return (
    <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
      <span style={{ ...shared.ellipsis, fontSize: 14, fontWeight: 600 }}>{name}</span>
      {name !== email ? <span style={{ ...shared.muted, ...shared.ellipsis, fontSize: 12 }}>{email}</span> : null}
    </span>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: { gap: t.spacing.l, width: 'min(480px, 90vw)' },
  invite: { gap: t.spacing.s },
  section: { gap: t.spacing.s },
  roleSelect: { width: 110, height: 32, fontSize: 13 },
}));
