import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { FiCornerLeftUp, FiTrash2, FiX } from 'react-icons/fi';
import {
  ProjectDetailResponse,
  ProjectType,
  StatusCategory,
  TaskDetailResponse,
  TaskPriority,
  UpdateTaskDto,
} from '~/api/api';
import { Button } from '~/components/Button';
import { ConfirmModal } from '~/components/ConfirmModal';
import { Loader } from '~/components/Loader';
import { useSidePanelReady } from '~/components/Modal';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useApi } from '~/hooks/useApi';
import { useModal } from '~/hooks/useModal';
import { useToast } from '~/hooks/useToast';
import { Comments } from '~/routes/Projects/components/Comments';
import { ProjectDocuments } from '~/routes/Projects/components/ProjectDocuments';
import { QuickAdd } from '~/routes/Projects/components/QuickAdd';
import { Checkbox, Field, PlainSelect, StatusDot, useProjectStyles } from '~/routes/Projects/components/shared';
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

  const deleteModal = useModal('project-task-delete', ConfirmModal, { title: 'Delete task' });

  if (!task || !project) return <Loader />;

  const editable = canEdit(project.role);
  const checkable = canCheck(project.role, project.viewersCanCheck);
  const done = task.status.category === StatusCategory.Done;
  const people = [project.owner, ...project.members.map((m) => m.user)];

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
        <Field label='Status'>
          <PlainSelect
            value={task.status.id}
            disabled={!editable}
            options={project.statuses.map((s) => ({ value: s.id, label: s.name }))}
            onChange={(statusId) => update({ statusId })}
          />
        </Field>
        <Field label='Assignee'>
          <PlainSelect
            value={task.assignee?.id ?? ''}
            disabled={!editable}
            options={[{ value: '', label: 'Nobody' }, ...people.map((u) => ({ value: u.id, label: userName(u) }))]}
            onChange={(assigneeId) => update({ assigneeId: assigneeId || null })}
          />
        </Field>
        <Field label='Due'>
          <input
            type='date'
            style={shared.textInput}
            disabled={!editable}
            value={toDateInput(task.dueDate)}
            onChange={(e) => update({ dueDate: fromDateInput(e.target.value) })}
          />
        </Field>
        <Field label='Priority'>
          <PlainSelect
            value={task.priority}
            disabled={!editable}
            options={Object.values(TaskPriority).map((value) => ({ value, label: PRIORITY_LABEL[value] }))}
            onChange={(priority) => update({ priority: priority as TaskPriority })}
          />
        </Field>
        <Field label='Quantity'>
          <div style={{ ...shared.row, flexWrap: 'nowrap' }}>
            <input
              style={{ ...shared.textInput, flex: 2 }}
              inputMode='decimal'
              disabled={!editable}
              value={quantity}
              placeholder={project.type === ProjectType.List ? '2' : '—'}
              onChange={(e) => setQuantity(e.target.value)}
              onBlur={saveQuantity}
            />
            <input
              style={{ ...shared.textInput, flex: 1 }}
              disabled={!editable}
              value={unit}
              placeholder='unit'
              onChange={(e) => setUnit(e.target.value)}
              onBlur={saveQuantity}
            />
          </div>
        </Field>
      </div>

      <Field label='Notes'>
        <textarea
          style={shared.textArea}
          rows={5}
          disabled={!editable}
          value={notes}
          placeholder={editable ? 'Details, links, measurements…' : ''}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => notes !== (task.notes ?? '') && update({ notes: notes || null })}
        />
      </Field>

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
  );
};

const useStyles = mkUseStyles((t) => ({
  container: { gap: t.spacing.l, paddingBottom: t.spacing.l },
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
