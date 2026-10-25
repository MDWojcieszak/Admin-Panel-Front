import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiAlertCircle, FiInbox, FiPlus, FiUsers } from 'react-icons/fi';
import { MdOutlineChecklist } from 'react-icons/md';
import { ProjectSummaryResponse } from '~/api/api';
import { Badge } from '~/components/Badge';
import { Button } from '~/components/Button';
import { EmptyState } from '~/components/EmptyState';
import { Loader } from '~/components/Loader';
import { PageHeader } from '~/components/PageHeader';
import { SegmentedTabs } from '~/components/SegmentedTabs';
import { useApi } from '~/hooks/useApi';
import { useAsync } from '~/hooks/useAsync';
import { useModal } from '~/hooks/useModal';
import { ProjectsPage, useProjectStyles } from '~/routes/Projects/components/shared';
import { useProjectEvents } from '~/routes/Projects/hooks/useProjectEvents';
import { CreateProjectModal } from '~/routes/Projects/modals/CreateProjectModal';
import {
  donePercent,
  dueLabel,
  projectPath,
  ROLE_LABEL,
  ROLE_TONE,
  STATUS_LABEL,
  STATUS_TONE,
  TYPE_LABEL,
  userName,
} from '~/routes/Projects/utils';
import { mkUseStyles, useTheme } from '~/utils/theme';

enum Scope {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

/** Every project you own or were invited to; the inbox comes first. */
export const Projects = () => {
  const styles = useStyles();
  const theme = useTheme();
  const navigate = useNavigate();
  const { projectsApi } = useApi();
  const [scope, setScope] = useState(Scope.ACTIVE);

  const query = useAsync<ProjectSummaryResponse[]>(async () => {
    if (!projectsApi) return undefined;
    const { data } = await projectsApi.projectControllerList({ archived: scope === Scope.ARCHIVED });
    return data;
  }, [projectsApi, scope]);

  useProjectEvents(() => query.reload());

  const createModal = useModal('project-create', CreateProjectModal, { title: 'New project' });

  const projects = query.data ?? [];

  return (
    <ProjectsPage
      header={
        <>
          <PageHeader
            title='Projects'
            meta={projects.length ? `${projects.length} ${scope === Scope.ARCHIVED ? 'archived' : 'open'}` : undefined}
            actions={
              <Button
                label='New project'
                icon={<FiPlus size={14} />}
                onClick={() => createModal.show({ onCreated: (id: string) => navigate(projectPath(id)) })}
              />
            }
          />
          <SegmentedTabs
            items={[
              { label: 'Open', value: Scope.ACTIVE },
              { label: 'Archived', value: Scope.ARCHIVED },
            ]}
            selected={scope}
            handleSelect={(value) => setScope(value as Scope)}
            layoutId='projects-scope'
          />
        </>
      }
    >
      {query.loading && !query.data ? (
        <Loader />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={<MdOutlineChecklist size={26} color={theme.colors.blue04} />}
          title={scope === Scope.ARCHIVED ? 'Nothing archived' : 'No projects yet'}
          description={
            scope === Scope.ARCHIVED
              ? 'Archived projects keep their tasks, out of the way.'
              : 'A project holds tasks, a shopping list or a build. Share it with whoever helps.'
          }
        />
      ) : (
        <div style={styles.grid}>
          {projects.map((project) => (
            <ProjectTile key={project.id} project={project} onOpen={() => navigate(projectPath(project.id))} />
          ))}
        </div>
      )}
    </ProjectsPage>
  );
};

const ProjectTile = ({ project, onOpen }: { project: ProjectSummaryResponse; onOpen: () => void }) => {
  const styles = useStyles();
  const shared = useProjectStyles();
  const theme = useTheme();
  const [hover, setHover] = useState(false);
  const { progress } = project;
  const percent = donePercent(progress);
  const accent = project.color || theme.colors.blue03;

  return (
    <button
      type='button'
      style={{ ...styles.tile, ...(hover ? styles.tileHover : {}), borderLeftColor: accent }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onOpen}
    >
      <div style={styles.tileTop}>
        {project.isInbox ? <FiInbox size={16} color={theme.colors.blue04} /> : null}
        <span style={styles.name}>{project.title}</span>
        <span style={shared.key}>{project.key}</span>
      </div>
      {project.description ? (
        <span style={{ ...shared.muted, ...styles.description }}>{project.description}</span>
      ) : null}
      <div style={shared.row}>
        {!project.isInbox ? <Badge label={TYPE_LABEL[project.type]} /> : null}
        {!project.isInbox ? <Badge label={STATUS_LABEL[project.status]} tone={STATUS_TONE[project.status]} /> : null}
        {project.role !== 'OWNER' ? (
          <Badge label={`${ROLE_LABEL[project.role]} · ${userName(project.owner)}`} tone={ROLE_TONE[project.role]} />
        ) : null}
        {project.memberCount > 0 ? (
          <Badge label={project.memberCount + 1} icon={<FiUsers size={12} />} tone='purple' />
        ) : null}
        {progress.overdue ? (
          <Badge label={`${progress.overdue} overdue`} tone='red' icon={<FiAlertCircle size={12} />} />
        ) : null}
      </div>
      <div style={styles.footer}>
        <div style={styles.bar}>
          <div style={{ ...styles.barFill, width: `${percent}%` }} />
        </div>
        <span style={shared.muted}>
          {progress.total ? `${progress.done}/${progress.total}` : 'No tasks'}
          {project.dueDate ? ` · due ${dueLabel(project.dueDate)}` : ''}
        </span>
      </div>
    </button>
  );
};

const useStyles = mkUseStyles((t) => ({
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))', gap: t.spacing.m },
  tile: {
    display: 'flex',
    flexDirection: 'column',
    gap: t.spacing.s,
    padding: t.spacing.m,
    textAlign: 'left',
    cursor: 'pointer',
    color: 'inherit',
    font: 'inherit',
    borderRadius: t.borderRadius.large,
    backgroundColor: t.colors.gray03 + t.colorOpacity(0.7),
    border: 'none',
    borderLeft: '3px solid transparent',
    transition: 'background-color 0.12s ease',
  },
  tileHover: { backgroundColor: t.colors.gray02 + t.colorOpacity(0.75) },
  tileTop: { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: t.spacing.s },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: 700,
    color: t.colors.white,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  description: {
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  footer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.sm,
    marginTop: 'auto',
    paddingTop: t.spacing.s,
  },
  bar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: t.colors.white + t.colorOpacity(0.08),
  },
  barFill: { height: '100%', borderRadius: 3, backgroundColor: t.colors.lightGreen, transition: 'width 0.3s ease' },
}));
