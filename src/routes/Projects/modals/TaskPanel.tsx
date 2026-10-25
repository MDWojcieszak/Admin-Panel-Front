import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { FiCornerLeftUp, FiCornerUpRight, FiTrash2, FiX } from 'react-icons/fi';
import {
  ProjectDetailResponse,
  ProjectRole,
  ProjectSummaryResponse,
  ProjectType,
  RepeatType,
  StatusCategory,
  TaskDetailResponse,
  TaskPriority,
  UpdateTaskDto,
} from '~/api/api';
import { Button } from '~/components/Button';
import { ConfirmModal } from '~/components/ConfirmModal';
import { DateField, DateTimeField, TextAreaField, TextField } from '~/components/ControlledFields';
import { Loader } from '~/components/Loader';
import { useSidePanelReady } from '~/components/Modal';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useApi } from '~/hooks/useApi';
import { useModal } from '~/hooks/useModal';
import { useToast } from '~/hooks/useToast';
import { PanelScroll } from '~/routes/Projects/components/PanelScroll';
import { Comments } from '~/routes/Projects/components/Comments';
import { ProjectDocuments } from '~/routes/Projects/components/ProjectDocuments';
import { QuickAdd } from '~/routes/Projects/components/QuickAdd';
import { Checkbox, PlainSelect, StatusDot, useProjectStyles } from '~/routes/Projects/components/shared';
import { TaskMeta } from '~/routes/Projects/components/TaskMeta';
import { useProjectEvents } from '~/routes/Projects/hooks/useProjectEvents';
import { canCheck, canEdit, fromDateInput, PRIORITY_LABEL, toDateInput, userName } from '~/routes/Projects/utils';
import { getApiErrorMessage } from '~/utils/apiError';
import { mkUseStyles, useTheme } from '~/utils/theme';

type TaskPanelProps = {
  taskId: string;
  /** Called however the panel closes, including from inside (a deleted task). */
  onClose?: () => void;
} & Partial<InternalModalProps>;

const REPEAT_LABEL: Record<RepeatType, string> = {
  NONE: 'Does not repeat',
  DAILY: 'Every day',
  WEEKLY: 'Every week',
  MONTHLY: 'Every month',
  YEARLY: 'Every year',
  CUSTOM: 'Every…',
};

/** A text field's local draft; it follows the server only when the server's value changes. */
const useDraft = (value: string) => {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  return [draft, setDraft] as const;
};

/**
 * One task, edited field by field: each change is saved as it is made. Subtasks
 * and the parent open in the same panel.
 */
export const TaskPanel = (p: TaskPanelProps) => {
  const styles = useStyles();
  const shared = useProjectStyles();
  const theme = useTheme();
  const ready = useSidePanelReady();
  const { tasksApi, projectsApi } = useApi();
  const toast = useToast();
  const [taskId, setTaskId] = useState(p.taskId);
  const [task, setTask] = useState<TaskDetailResponse>();
  const [project, setProject] = useState<ProjectDetailResponse>();
  const [newItem, setNewItem] = useState('');

  useEffect(() => setTaskId(p.taskId), [p.taskId]);

  const close = () => {
    p.handleClose?.();
    p.onClose?.();
  };

  const load = async () => {
    if (!tasksApi || !projectsApi) return;
    try {
      const { data } = await tasksApi.taskControllerGet({ id: taskId });
      setTask(data);
      if (project?.id !== data.project.id) {
        const { data: detail } = await projectsApi.projectControllerGet({ id: data.project.id });
        setProject(detail);
      }
    } catch (e) {
      toast(getApiErrorMessage(e, 'Could not load the task.'), 'error');
      close();
    }
  };

  useEffect(() => {
    if (ready) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, taskId, tasksApi]);

  useProjectEvents(
    (event) => {
      // Statuses, members or roles changed: the pickers and what you may do follow.
      if (event.kind !== 'task' && projectsApi) {
        projectsApi
          .projectControllerGet({ id: event.projectId })
          .then(({ data }) => setProject(data))
          .catch(() => close());
      }
      load();
    },
    task?.project.id,
  );

  const [title, setTitle] = useDraft(task?.title ?? '');
  const [notes, setNotes] = useDraft(task?.notes ?? '');
  const [quantity, setQuantity] = useDraft(task?.quantity != null ? String(task.quantity) : '');
  const [unit, setUnit] = useDraft(task?.unit ?? '');
  const [repeatCustom, setRepeatCustom] = useDraft(task?.repeatCustom ?? '');

  const deleteModal = useModal('project-task-delete', ConfirmModal, { title: 'Delete task' });

  if (!task || !project) return <Loader />;

  const editable = canEdit(project.role);
  const checkable = canCheck(project.role, project.viewersCanCheck);
  const done = task.status.category === StatusCategory.Done;
  // The owner comes first in `members`.
  const people = project.members.map((m) => m.user);

  const run = async <T,>(action: () => Promise<T>, failure: string) => {
    try {
      return await action();
    } catch (e) {
      toast(getApiErrorMessage(e, failure), 'error');
      load();
    }
  };

  const update = (dto: UpdateTaskDto) =>
    run(async () => {
      if (!tasksApi) return;
      const { data } = await tasksApi.taskControllerUpdate({ id: task.id, updateTaskDto: dto });
      setTask(data);
    }, 'Could not save the task.');

  const toggle = (id: string) =>
    run(async () => {
      if (!tasksApi) return;
      const { data } = await tasksApi.taskControllerToggle({ id });
      if (id === task.id) setTask(data);
      else load();
    }, 'Could not change the task.');

  const setChecklist = (items: TaskDetailResponse['checklistItems']) =>
    setTask((t) =>
      t
        ? { ...t, checklistItems: items, checklist: { total: items.length, done: items.filter((i) => i.done).length } }
        : t,
    );

  const saveQuantity = () => {
    const value = quantity.trim() ? Number(quantity.replace(',', '.')) : null;
    if (value !== null && Number.isNaN(value)) return setQuantity(task.quantity != null ? String(task.quantity) : '');
    if (value !== (task.quantity ?? null) || (unit.trim() || null) !== (task.unit ?? null)) {
      update({ quantity: value, unit: unit.trim() || null });
    }
  };

  return (
    <PanelScroll>
      <div style={styles.container}>
        <div style={{ ...shared.row, justifyContent: 'space-between' }}>
          <span style={shared.row}>
            <span style={shared.key}>{task.key}</span>
            <span style={shared.muted}>· {task.project.isInbox ? 'Inbox' : task.project.title}</span>
          </span>
          {task.parent ? (
            <button type='button' style={styles.link} onClick={() => setTaskId(task.parent!.id)}>
              <FiCornerLeftUp size={13} />
              {task.parent.key} {task.parent.title}
            </button>
          ) : null}
        </div>

        <div style={styles.titleRow}>
          <Checkbox checked={done} disabled={!checkable} size={24} onChange={() => toggle(task.id)} />
          <textarea
            style={styles.title}
            rows={Math.max(1, Math.ceil(title.length / 34))}
            value={title}
            disabled={!editable}
            onChange={(e) => setTitle(e.target.value.replace(/\n/g, ''))}
            onBlur={() => title.trim() && title.trim() !== task.title && update({ title: title.trim() })}
            onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLTextAreaElement).blur()}
          />
        </div>

        <div style={shared.fieldGrid}>
          <PlainSelect
            label='Status'
            value={task.status.id}
            disabled={!editable}
            options={project.statuses.map((s) => ({ value: s.id, label: s.name }))}
            onChange={(statusId) => update({ statusId })}
          />
          <PlainSelect
            label='Assignee'
            value={task.assignee?.id ?? ''}
            disabled={!editable}
            options={[{ value: '', label: 'Nobody' }, ...people.map((u) => ({ value: u.id, label: userName(u) }))]}
            onChange={(assigneeId) => update({ assigneeId: assigneeId || null })}
          />
          <PlainSelect
            label='Priority'
            value={task.priority}
            disabled={!editable}
            options={Object.values(TaskPriority).map((value) => ({ value, label: PRIORITY_LABEL[value] }))}
            onChange={(priority) => update({ priority: priority as TaskPriority })}
          />
          <DateField
            label='Due'
            disabled={!editable}
            value={toDateInput(task.dueDate)}
            onChange={(value) => update({ dueDate: fromDateInput(value) })}
          />
        </div>

        {/* Fields that come in pairs get wider cells of their own. */}
        <div style={styles.pairGrid}>
          <DateTimeField
            dateLabel='Remind me'
            timeLabel='At'
            disabled={!editable}
            description='An email when the time comes, to whoever the task is on'
            value={task.reminderAt}
            onChange={(reminderAt) => update({ reminderAt })}
          />
          <div style={styles.pair}>
            <PlainSelect
              label='Repeat'
              value={task.repeat}
              disabled={!editable}
              style={{ flex: 2, minWidth: 0 }}
              options={Object.values(RepeatType).map((value) => ({ value, label: REPEAT_LABEL[value] }))}
              onChange={(repeat) =>
                update(
                  repeat === RepeatType.Custom
                    ? { repeat: RepeatType.Custom, repeatCustom: task.repeatCustom || '2w' }
                    : { repeat: repeat as RepeatType, repeatCustom: null },
                )
              }
            />
            {task.repeat === RepeatType.Custom ? (
              <TextField
                label='Every'
                disabled={!editable}
                style={{ flex: 1, minWidth: 0 }}
                value={repeatCustom}
                placeholder='3d, 2w, 6m, 1y'
                onChange={setRepeatCustom}
                onCommit={(raw) => {
                  const value = raw.trim().toLowerCase();
                  if (value === task.repeatCustom) return;
                  if (/^[1-9]\d{0,2}\s*[dwmy]$/.test(value)) update({ repeatCustom: value });
                  else setRepeatCustom(task.repeatCustom ?? '');
                }}
              />
            ) : null}
          </div>
          <div style={styles.pair}>
            <TextField
              label='Quantity'
              inputMode='decimal'
              disabled={!editable}
              style={{ flex: 2, minWidth: 0 }}
              value={quantity}
              placeholder={project.type === ProjectType.List ? '2' : ''}
              onChange={setQuantity}
              onCommit={saveQuantity}
            />
            <TextField
              label='Unit'
              disabled={!editable}
              style={{ flex: 1, minWidth: 0 }}
              value={unit}
              placeholder='kg, pcs'
              onChange={setUnit}
              onCommit={saveQuantity}
            />
          </div>
        </div>

        <TextAreaField
          label='Notes'
          rows={4}
          disabled={!editable}
          value={notes}
          placeholder={editable ? 'Details, links, measurements…' : ''}
          onChange={setNotes}
          onCommit={(value) => value !== (task.notes ?? '') && update({ notes: value || null })}
        />

        <div style={styles.section}>
          <span style={shared.fieldLabel}>
            Checklist{task.checklist.total ? ` · ${task.checklist.done}/${task.checklist.total}` : ''}
          </span>
          {task.checklistItems.length ? (
            <div style={shared.list}>
              {task.checklistItems.map((item) => (
                <div key={item.id} style={shared.listRow}>
                  <Checkbox
                    checked={item.done}
                    disabled={!checkable}
                    size={18}
                    onChange={() =>
                      run(async () => {
                        if (!tasksApi) return;
                        const { data } = await tasksApi.taskControllerUpdateChecklistItem({
                          id: task.id,
                          itemId: item.id,
                          updateChecklistItemDto: { done: !item.done },
                        });
                        setChecklist(data);
                      }, 'Could not tick the item.')
                    }
                  />
                  <span
                    style={{
                      flex: 1,
                      fontSize: 14,
                      color: item.done ? theme.colors.dark05 : theme.colors.white,
                      textDecoration: item.done ? 'line-through' : undefined,
                    }}
                  >
                    {item.content}
                  </span>
                  {editable ? (
                    <button
                      type='button'
                      title='Remove'
                      style={shared.iconButton}
                      onClick={() =>
                        run(async () => {
                          if (!tasksApi) return;
                          const { data } = await tasksApi.taskControllerRemoveChecklistItem({
                            id: task.id,
                            itemId: item.id,
                          });
                          setChecklist(data);
                        }, 'Could not remove the item.')
                      }
                    >
                      <FiX size={14} />
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
          {editable ? (
            <input
              style={shared.textInput}
              value={newItem}
              placeholder='Add an item, Enter to save'
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== 'Enter' || !newItem.trim()) return;
                const content = newItem.trim();
                setNewItem('');
                run(async () => {
                  if (!tasksApi) return;
                  const { data } = await tasksApi.taskControllerAddChecklistItem({
                    id: task.id,
                    createChecklistItemDto: { content },
                  });
                  setChecklist(data);
                }, 'Could not add the item.');
              }}
            />
          ) : null}
        </div>

        {task.parentTaskId ? null : (
          <div style={styles.section}>
            <span style={shared.fieldLabel}>Subtasks{task.subtasks.length ? ` · ${task.subtasks.length}` : ''}</span>
            {task.subtasks.length ? (
              <div style={shared.list}>
                {task.subtasks.map((sub) => (
                  <div key={sub.id} style={{ ...shared.listRow, cursor: 'pointer' }} onClick={() => setTaskId(sub.id)}>
                    <Checkbox
                      checked={sub.status.category === StatusCategory.Done}
                      disabled={!checkable}
                      size={18}
                      onChange={() => toggle(sub.id)}
                    />
                    <StatusDot color={sub.status.color} />
                    <span style={{ flex: 1, fontSize: 14, color: theme.colors.white, minWidth: 0 }}>{sub.title}</span>
                    <span style={shared.key}>{sub.key}</span>
                    <TaskMeta task={sub} />
                  </div>
                ))}
              </div>
            ) : null}
            {editable ? (
              <QuickAdd
                placeholder='Add a subtask'
                onAdd={(dto) =>
                  run(async () => {
                    if (!projectsApi) return;
                    await projectsApi.projectControllerCreateTask({
                      id: task.project.id,
                      createTaskDto: { ...dto, parentTaskId: task.id },
                    });
                    await load();
                  }, 'Could not add the subtask.')
                }
              />
            ) : null}
          </div>
        )}

        <div style={styles.section}>
          <span style={shared.fieldLabel}>Files</span>
          <ProjectDocuments compact target={{ taskId: task.id }} projectId={task.project.id} editable={editable} />
        </div>

        <div style={styles.section}>
          <span style={shared.fieldLabel}>Comments</span>
          <Comments target={{ taskId: task.id }} projectId={task.project.id} />
        </div>

        {editable ? (
          <MoveToProject
            task={task}
            onMoved={(message) => {
              toast(message, 'success');
              close();
            }}
          />
        ) : null}

        <div style={styles.footer}>
          <span style={shared.muted}>
            {task.createdBy ? `Created by ${userName(task.createdBy)} · ` : ''}
            {format(new Date(task.createdAt), 'd MMM yyyy')}
            {task.completedAt
              ? ` · done ${format(new Date(task.completedAt), 'd MMM')}${
                  task.completedBy ? ` by ${userName(task.completedBy)}` : ''
                }`
              : ''}
          </span>
          {editable ? (
            <Button
              label='Delete'
              variant='danger'
              icon={<FiTrash2 size={14} />}
              onClick={() =>
                deleteModal.show({
                  message: `Delete ${task.key}?`,
                  description: task.subtasks.length
                    ? `Its ${task.subtasks.length} subtasks and the checklist go with it.`
                    : 'The checklist goes with it.',
                  confirmLabel: 'Delete',
                  danger: true,
                  onConfirm: async () => {
                    await run(async () => {
                      if (!tasksApi) return;
                      await tasksApi.taskControllerRemove({ id: task.id });
                      if (task.parentTaskId) setTaskId(task.parentTaskId);
                      else close();
                    }, 'Could not delete the task.');
                  },
                })
              }
            />
          ) : null}
        </div>
      </div>
    </PanelScroll>
  );
};

/**
 * Into another project you can edit: the inbox's way out, or a task that was
 * put in the wrong place. Subtasks, checklist and comments go along.
 */
const MoveToProject = ({ task, onMoved }: { task: TaskDetailResponse; onMoved: (message: string) => void }) => {
  const styles = useStyles();
  const shared = useProjectStyles();
  const toast = useToast();
  const { projectsApi, tasksApi } = useApi();
  const [targets, setTargets] = useState<ProjectSummaryResponse[]>();
  const [target, setTarget] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!projectsApi) return;
    projectsApi
      .projectControllerList({ archived: false })
      .then(({ data }) => setTargets(data.filter((p) => p.id !== task.project.id && p.role !== ProjectRole.Viewer)))
      .catch(() => setTargets([]));
  }, [projectsApi, task.project.id]);

  if (!targets?.length) return null;

  const move = async () => {
    if (!tasksApi || !target) return;
    setBusy(true);
    try {
      const { data } = await tasksApi.taskControllerMoveToProject({
        id: task.id,
        moveTaskToProjectDto: { projectId: target },
      });
      const where = data.task.project.isInbox ? 'the inbox' : data.task.project.title;
      onMoved(
        `Moved to ${where} as ${data.task.key}.` +
          (data.droppedDocuments
            ? ` ${data.droppedDocuments} file${data.droppedDocuments === 1 ? '' : 's'} pinned by others stayed behind.`
            : ''),
      );
    } catch (e) {
      toast(getApiErrorMessage(e, 'Could not move the task.'), 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={styles.section}>
      <span style={shared.fieldLabel}>Move to another project</span>
      <div style={styles.moveRow}>
        <PlainSelect
          value={target}
          options={[
            { value: '', label: 'Choose a project…' },
            ...targets.map((p) => ({ value: p.id, label: p.isInbox ? 'Inbox' : `${p.key} · ${p.title}` })),
          ]}
          onChange={setTarget}
          style={styles.moveSelect}
        />
        <Button
          label='Move'
          variant='secondary'
          icon={<FiCornerUpRight size={14} />}
          disabled={!target || busy}
          loading={busy}
          onClick={move}
        />
      </div>
      {task.subtasks.length ? (
        <span style={shared.muted}>
          Its {task.subtasks.length} subtask{task.subtasks.length === 1 ? '' : 's'} go along.
        </span>
      ) : null}
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: { gap: t.spacing.l, paddingBottom: t.spacing.l },
  // Stretch: the Move button takes the select's height instead of sitting short beside it.
  moveRow: { flexDirection: 'row', alignItems: 'stretch', gap: t.spacing.s },
  moveSelect: { flex: 1, minWidth: 0 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: t.spacing.sm },
  title: {
    flex: 1,
    padding: 0,
    border: 'none',
    outline: 'none',
    resize: 'none',
    background: 'transparent',
    color: t.colors.white,
    fontFamily: 'inherit',
    fontSize: 20,
    fontWeight: 700,
    lineHeight: 1.3,
  },
  section: { gap: t.spacing.s },
  // Two fields sharing one cell of the grid: repeat + its interval, quantity + unit.
  pair: { flexDirection: 'row', gap: t.spacing.s, minWidth: 0 },
  pairGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))',
    gap: t.spacing.sm,
    marginTop: -t.spacing.s,
  },
  link: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: 0,
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontSize: 13,
    color: t.colors.blue04,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.m,
    flexWrap: 'wrap',
    paddingTop: t.spacing.m,
    borderTop: `1px solid ${t.colors.white + t.colorOpacity(0.06)}`,
  },
}));
