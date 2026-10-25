import { useEffect, useState } from 'react';
import { FiArchive, FiArrowDown, FiArrowUp, FiPlus, FiTrash2, FiX } from 'react-icons/fi';
import {
  ProjectDetailResponse,
  ProjectRole,
  ProjectStatus,
  ProjectStatusResponse,
  ProjectType,
  StatusCategory,
} from '~/api/api';
import { Button } from '~/components/Button';
import { ConfirmModal } from '~/components/ConfirmModal';
import { Loader } from '~/components/Loader';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useApi } from '~/hooks/useApi';
import { useModal } from '~/hooks/useModal';
import { useToast } from '~/hooks/useToast';
import { Field, PlainSelect, useProjectStyles } from '~/routes/Projects/components/shared';
import { CATEGORY_LABEL, fromDateInput, STATUS_LABEL, toDateInput, TYPE_LABEL } from '~/routes/Projects/utils';
import { getApiErrorMessage } from '~/utils/apiError';
import { mkUseStyles } from '~/utils/theme';

type ProjectSettingsModalProps = {
  projectId: string;
  /** Deleted or archived: the project page has nothing left to show. */
  onGone?: () => void;
} & Partial<InternalModalProps>;

const CATEGORY_OPTIONS = Object.values(StatusCategory).map((value) => ({ value, label: CATEGORY_LABEL[value] }));

export const ProjectSettingsModal = (p: ProjectSettingsModalProps) => {
  const styles = useStyles();
  const shared = useProjectStyles();
  const { projectsApi } = useApi();
  const toast = useToast();
  const [project, setProject] = useState<ProjectDetailResponse>();

  const load = async () => {
    if (!projectsApi) return;
    try {
      const { data } = await projectsApi.projectControllerGet({ id: p.projectId });
      setProject(data);
    } catch (e) {
      toast(getApiErrorMessage(e, 'Could not load the project.'), 'error');
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectsApi, p.projectId]);

  const confirmModal = useModal('project-settings-confirm', ConfirmModal, { title: 'Delete project' });

  if (!project) return <Loader />;

  const owns = project.role === ProjectRole.Owner;

  const run = async (action: () => Promise<unknown>, failure: string) => {
    try {
      await action();
      await load();
      return true;
    } catch (e) {
      toast(getApiErrorMessage(e, failure), 'error');
      return false;
    }
  };

  return (
    <div style={styles.container}>
      <DetailsForm project={project} owns={owns} onSaved={setProject} />
      <Workflow project={project} run={run} />

      {owns && !project.isInbox ? (
        <div style={styles.section}>
          <span style={shared.fieldLabel}>Project</span>
          <div style={shared.row}>
            <Button
              label={project.archivedAt ? 'Restore from archive' : 'Archive'}
              variant='secondary'
              icon={<FiArchive size={14} />}
              onClick={() =>
                run(async () => {
                  if (!projectsApi) return;
                  await projectsApi.projectControllerUpdate({
                    id: project.id,
                    updateProjectDto: { archived: !project.archivedAt },
                  });
                  if (!project.archivedAt) {
                    toast('Archived. Find it under Projects → Archived.', 'success');
                  }
                }, 'Could not archive the project.')
              }
            />
            <Button
              label='Delete project'
              variant='danger'
              icon={<FiTrash2 size={14} />}
              onClick={() =>
                confirmModal.show({
                  message: `Delete ${project.title}?`,
                  description: `All ${project.progress.total} tasks go with it, for everyone it is shared with. This cannot be undone.`,
                  confirmLabel: 'Delete',
                  danger: true,
                  onConfirm: async () => {
                    if (!projectsApi) return;
                    try {
                      await projectsApi.projectControllerRemove({ id: project.id });
                      p.handleClose?.();
                      p.onGone?.();
                    } catch (e) {
                      toast(getApiErrorMessage(e, 'Could not delete the project.'), 'error');
                    }
                  },
                })
              }
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};

const DetailsForm = ({
  project,
  owns,
  onSaved,
}: {
  project: ProjectDetailResponse;
  owns: boolean;
  onSaved: (project: ProjectDetailResponse) => void;
}) => {
  const styles = useStyles();
  const shared = useProjectStyles();
  const { projectsApi } = useApi();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const initial = () => ({
    title: project.title,
    key: project.key,
    description: project.description ?? '',
    type: project.type,
    status: project.status,
    startDate: toDateInput(project.startDate),
    dueDate: toDateInput(project.dueDate),
    color: project.color ?? '',
  });
  const [form, setForm] = useState(initial);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setForm(initial()), [project.updatedAt]);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));
  const editable = project.role !== ProjectRole.Viewer;

  const save = async () => {
    if (!projectsApi || !form.title.trim()) return;
    setSaving(true);
    try {
      const { data } = await projectsApi.projectControllerUpdate({
        id: project.id,
        updateProjectDto: {
          title: form.title.trim(),
          description: form.description.trim() || null,
          startDate: fromDateInput(form.startDate),
          dueDate: fromDateInput(form.dueDate),
          color: form.color || null,
          ...(project.isInbox ? {} : { type: form.type, status: form.status }),
          ...(owns && !project.isInbox && form.key !== project.key ? { key: form.key } : {}),
        },
      });
      onSaved(data);
      toast('Saved', 'success');
    } catch (e) {
      toast(getApiErrorMessage(e, 'Could not save the project.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.section}>
      <span style={shared.fieldLabel}>Details</span>
      <Field label='Title'>
        <input
          style={shared.textInput}
          disabled={!editable}
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
        />
      </Field>
      <Field label='Description'>
        <textarea
          style={shared.textArea}
          rows={3}
          disabled={!editable}
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
        />
      </Field>
      <div style={shared.fieldGrid}>
        {project.isInbox ? null : (
          <>
            <Field label='Status'>
              <PlainSelect
                value={form.status}
                disabled={!editable}
                options={Object.values(ProjectStatus).map((value) => ({ value, label: STATUS_LABEL[value] }))}
                onChange={(value) => set('status', value as ProjectStatus)}
              />
            </Field>
            <Field label='Type'>
              <PlainSelect
                value={form.type}
                disabled={!editable}
                options={Object.values(ProjectType).map((value) => ({ value, label: TYPE_LABEL[value] }))}
                onChange={(value) => set('type', value as ProjectType)}
              />
            </Field>
            <Field label='Key'>
              <input
                style={{ ...shared.textInput, ...shared.mono }}
                disabled={!owns}
                maxLength={6}
                value={form.key}
                title={owns ? 'Renames every task key: ASTRO-3 becomes NEW-3' : 'Only the owner changes the key'}
                onChange={(e) => set('key', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
              />
            </Field>
          </>
        )}
        <Field label='Start'>
          <input
            type='date'
            style={shared.textInput}
            disabled={!editable}
            value={form.startDate}
            onChange={(e) => set('startDate', e.target.value)}
          />
        </Field>
        <Field label='Due'>
          <input
            type='date'
            style={shared.textInput}
            disabled={!editable}
            value={form.dueDate}
            onChange={(e) => set('dueDate', e.target.value)}
          />
        </Field>
        <Field label='Colour'>
          <div style={{ ...shared.row, flexWrap: 'nowrap' }}>
            <input
              type='color'
              style={styles.color}
              disabled={!editable}
              value={form.color || '#447596'}
              onChange={(e) => set('color', e.target.value)}
            />
            {form.color ? (
              <button type='button' title='No colour' style={shared.iconButton} onClick={() => set('color', '')}>
                <FiX size={14} />
              </button>
            ) : null}
          </div>
        </Field>
      </div>
      {editable ? <Button label='Save details' onClick={save} loading={saving} disabled={!form.title.trim()} /> : null}
    </div>
  );
};

/**
 * The statuses tasks move through (D13). Names and colours are free; the
 * category decides what counts as done. A status with tasks hands them to
 * another before it goes.
 */
const Workflow = ({
  project,
  run,
}: {
  project: ProjectDetailResponse;
  run: (action: () => Promise<unknown>, failure: string) => Promise<boolean>;
}) => {
  const styles = useStyles();
  const shared = useProjectStyles();
  const { projectsApi } = useApi();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<StatusCategory>(StatusCategory.InProgress);
  const [removing, setRemoving] = useState<string>();
  const [moveTo, setMoveTo] = useState('');
  const editable = project.role !== ProjectRole.Viewer;
  const statuses = project.statuses;

  const move = (index: number, by: number) => {
    const ids = statuses.map((s) => s.id);
    const [id] = ids.splice(index, 1);
    ids.splice(index + by, 0, id);
    run(
      () =>
        projectsApi
          ? projectsApi.projectControllerReorderStatuses({ id: project.id, reorderDto: { ids } })
          : Promise.resolve(),
      'Could not reorder.',
    );
  };

  const update = (status: ProjectStatusResponse, dto: { name?: string; category?: StatusCategory; color?: string }) =>
    run(
      () =>
        projectsApi
          ? projectsApi.projectControllerUpdateStatus({
              id: project.id,
              statusId: status.id,
              updateProjectStatusDto: dto,
            })
          : Promise.resolve(),
      'Could not change the status.',
    );

  return (
    <div style={styles.section}>
      <span style={shared.fieldLabel}>Workflow</span>
      <span style={shared.muted}>
        Columns on the board, left to right. Tasks in a Done status count as finished; a project keeps at least one To
        do and one Done.
      </span>
      <div style={shared.list}>
        {statuses.map((status, index) => (
          <div key={status.id} style={styles.statusBlock}>
            <div style={{ ...shared.listRow, ...styles.statusRow }}>
              <input
                key={status.color ?? ''}
                type='color'
                style={styles.color}
                disabled={!editable}
                defaultValue={status.color || '#92A4B1'}
                onBlur={(e) => e.target.value !== status.color && update(status, { color: e.target.value })}
              />
              <input
                key={status.name}
                style={{ ...shared.textInput, flex: 1, minWidth: 100 }}
                disabled={!editable}
                defaultValue={status.name}
                onBlur={(e) => {
                  const value = e.target.value.trim();
                  if (value && value !== status.name) update(status, { name: value });
                  else e.target.value = status.name;
                }}
              />
              <PlainSelect
                value={status.category}
                disabled={!editable}
                style={styles.category}
                options={CATEGORY_OPTIONS}
                onChange={(value) => update(status, { category: value as StatusCategory })}
              />
              <span style={{ ...shared.muted, width: 28, textAlign: 'right' }} title='Tasks in this status'>
                {status.taskCount}
              </span>
              {editable ? (
                <span style={{ ...shared.row, gap: 0, flexWrap: 'nowrap' }}>
                  <button
                    type='button'
                    title='Earlier in the workflow'
                    style={shared.iconButton}
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                  >
                    <FiArrowUp size={14} />
                  </button>
                  <button
                    type='button'
                    title='Later in the workflow'
                    style={shared.iconButton}
                    disabled={index === statuses.length - 1}
                    onClick={() => move(index, 1)}
                  >
                    <FiArrowDown size={14} />
                  </button>
                  <button
                    type='button'
                    title='Delete status'
                    style={shared.iconButton}
                    onClick={() => {
                      setRemoving(removing === status.id ? undefined : status.id);
                      setMoveTo(statuses.find((s) => s.id !== status.id && s.category === status.category)?.id ?? '');
                    }}
                  >
                    <FiTrash2 size={14} />
                  </button>
                </span>
              ) : null}
            </div>
            {removing === status.id ? (
              <div style={{ ...shared.listRow, ...styles.removeRow }}>
                <span style={shared.muted}>
                  {status.taskCount ? `Move its ${status.taskCount} tasks to` : 'Delete it; new tasks would go to'}
                </span>
                <PlainSelect
                  value={moveTo}
                  style={{ width: 'auto', flex: 1 }}
                  options={[
                    { value: '', label: 'Choose a status' },
                    ...statuses.filter((s) => s.id !== status.id).map((s) => ({ value: s.id, label: s.name })),
                  ]}
                  onChange={setMoveTo}
                />
                <Button
                  label='Delete'
                  variant='danger'
                  disabled={!moveTo}
                  onClick={async () => {
                    const ok = await run(
                      () =>
                        projectsApi
                          ? projectsApi.projectControllerRemoveStatus({
                              id: project.id,
                              statusId: status.id,
                              moveToStatusId: moveTo,
                            })
                          : Promise.resolve(),
                      'Could not delete the status.',
                    );
                    if (ok) setRemoving(undefined);
                  }}
                />
              </div>
            ) : null}
          </div>
        ))}
      </div>
      {editable ? (
        <div style={{ ...shared.row, flexWrap: 'nowrap' }}>
          <input
            style={{ ...shared.textInput, flex: 1 }}
            value={name}
            placeholder='New status, e.g. Waiting for parts'
            onChange={(e) => setName(e.target.value)}
          />
          <PlainSelect
            value={category}
            style={styles.category}
            options={CATEGORY_OPTIONS}
            onChange={(value) => setCategory(value as StatusCategory)}
          />
          <Button
            label='Add'
            icon={<FiPlus size={14} />}
            disabled={!name.trim()}
            onClick={async () => {
              const ok = await run(
                () =>
                  projectsApi
                    ? projectsApi.projectControllerCreateStatus({
                        id: project.id,
                        createProjectStatusDto: { name: name.trim(), category },
                      })
                    : Promise.resolve(),
                'Could not add the status.',
              );
              if (ok) setName('');
            }}
          />
        </div>
      ) : null}
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: { gap: t.spacing.xl, paddingBottom: t.spacing.l },
  section: { gap: t.spacing.sm },
  statusBlock: { gap: 1 },
  statusRow: { gap: t.spacing.s, flexWrap: 'wrap' },
  removeRow: { gap: t.spacing.s, flexWrap: 'wrap', backgroundColor: 'transparent' },
  category: { width: 130 },
  color: {
    width: 34,
    height: 30,
    padding: 0,
    border: 'none',
    borderRadius: 6,
    background: 'none',
    cursor: 'pointer',
    flexShrink: 0,
  },
}));
