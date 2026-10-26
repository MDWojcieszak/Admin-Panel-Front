import { useMemo, useRef } from 'react';
import { ProjectDetailResponse } from '~/api/api';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useApi } from '~/hooks/useApi';
import { fold } from '~/routes/Projects/import/csv';
import { ImportModal } from '~/routes/Projects/import/ImportModal';
import { ImportedTask, taskSchema } from '~/routes/Projects/import/taskSchema';
import { fromDateInput } from '~/routes/Projects/utils';

type TaskImportModalProps = {
  project: ProjectDetailResponse;
  onDone?: () => void;
} & Partial<InternalModalProps>;

/**
 * Tasks in bulk — a plan from a chat, a list from a spreadsheet. Rows go in
 * order: a parent is created before its subtasks, which find it by title.
 */
export const TaskImportModal = (p: TaskImportModalProps) => {
  const { projectsApi, tasksApi } = useApi();
  const schema = useMemo(() => taskSchema(p.project), [p.project]);
  // Ids of the tasks this import created, by folded title, for the subtasks after them.
  const created = useRef(new Map<string, string>());

  const importRow = async (task: ImportedTask, index: number) => {
    if (!projectsApi || !tasksApi) return;
    if (index === 0) created.current.clear();
    const { data } = await projectsApi.projectControllerCreateTask({
      id: p.project.id,
      createTaskDto: {
        title: task.title,
        notes: task.notes,
        statusId: task.statusId,
        priority: task.priority,
        dueDate: task.dueDate ? fromDateInput(task.dueDate) : null,
        assigneeId: task.assigneeId,
        quantity: task.quantity,
        unit: task.unit,
        parentTaskId: task.parent ? created.current.get(fold(task.parent)) ?? null : null,
      },
    });
    if (!task.parent) created.current.set(fold(task.title), data.id);
    for (const content of task.checklist) {
      await tasksApi.taskControllerAddChecklistItem({ id: data.id, createChecklistItemDto: { content } });
    }
  };

  return (
    <ImportModal<ImportedTask>
      schema={schema}
      fileName={`${p.project.title} tasks`}
      onDone={p.onDone}
      handleClose={p.handleClose}
      importRow={importRow}
    />
  );
};
