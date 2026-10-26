import { ProjectDetailResponse, StatusCategory, TaskPriority } from '~/api/api';
import { fold, toDay, toNumber } from '~/routes/Projects/import/csv';
import { CellResult, ImportSchema, addIssue } from '~/routes/Projects/import/schema';
import { PRIORITY_LABEL, userName } from '~/routes/Projects/utils';

/** A task as read from a row, ready to create once its parent (if any) exists. */
export type ImportedTask = {
  title: string;
  notes: string | null;
  statusId?: string;
  priority?: TaskPriority;
  /** YYYY-MM-DD. */
  dueDate: string | null;
  assigneeId: string | null;
  quantity: number | null;
  unit: string | null;
  checklist: string[];
  /** Title of a task earlier in the same import; the task is created under it. */
  parent: string | null;
};

/**
 * Words for a status category; one of them picks the first column of that
 * category. Shown in the instructions, compared without Polish letters.
 */
const CATEGORY_WORDS: Record<StatusCategory, string[]> = {
  TODO: ['todo', 'to do', 'open', 'backlog', 'new', 'do zrobienia', 'nowe', 'otwarte'],
  IN_PROGRESS: ['in progress', 'doing', 'started', 'wip', 'w trakcie', 'w toku', 'rozpoczęte'],
  DONE: ['done', 'finished', 'completed', 'closed', 'zrobione', 'gotowe', 'ukończone', 'zamknięte'],
};

const CATEGORY_TITLE: Record<StatusCategory, string> = {
  TODO: 'Not started',
  IN_PROGRESS: 'Under way',
  DONE: 'Finished',
};

const PRIORITY_WORDS: Record<TaskPriority, string[]> = {
  LOW: ['l', 'niski', 'niska', 'niskie'],
  MEDIUM: ['normal', 'm', 'średni', 'średnia', 'średnie', 'normalny'],
  HIGH: ['h', 'wysoki', 'wysoka', 'wysokie', 'ważne'],
  URGENT: ['critical', 'asap', 'pilne', 'pilny', 'krytyczne'],
};

const ok = (display: string): CellResult => ({ display });
const warn = (display: string, message: string): CellResult => ({ display, issue: { level: 'warning', message } });
const err = (display: string, message: string): CellResult => ({ display, issue: { level: 'error', message } });

/** Checklist items in one cell: separated by "|", or one per line. */
const splitChecklist = (text: string) =>
  text
    .split(/\||\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);

/** Tasks for one project: statuses and people are matched against its own. */
export const taskSchema = (project: ProjectDetailResponse): ImportSchema<ImportedTask> => {
  const statuses = project.statuses;
  const people = project.members.map((m) => m.user);
  const shopping = project.type === 'LIST';

  const statusOf = (text: string) => {
    const t = fold(text);
    const byName = statuses.find((s) => fold(s.name) === t);
    if (byName) return byName;
    const category = (Object.keys(CATEGORY_WORDS) as StatusCategory[]).find((c) =>
      CATEGORY_WORDS[c].some((w) => fold(w) === t),
    );
    return category ? statuses.find((s) => s.category === category) : undefined;
  };

  const personOf = (text: string) => {
    const t = fold(text);
    return people.find(
      (u) =>
        fold(u.email) === t ||
        fold(userName(u)) === t ||
        (u.firstName && fold(u.firstName) === t) ||
        fold(u.email.split('@')[0]) === t,
    );
  };

  return {
    id: 'tasks',
    noun: { one: 'task', many: 'tasks' },
    positional: ['title', 'notes', 'due'],
    promptIntro: shopping
      ? 'Make a shopping list for what is described below, as items I can paste into my list app.'
      : 'Break the project described below into tasks I can paste into my project planner.',
    promptRules: [
      'tasks in the order they should be done',
      'a subtask names its parent in Parent, exactly as the parent task is titled, and comes after it',
    ],
    columns: [
      {
        key: 'title',
        label: 'Task',
        aliases: ['title', 'name', 'item', 'zadanie', 'tytul', 'nazwa', 'pozycja'],
        required: true,
        type: 'text',
        description: shopping ? 'what to buy' : 'what to do, starting with a verb',
        example: shopping
          ? ['Flour', 'Eggs', 'Milk']
          : ['Order the stepper motors', 'Print the RA housing', 'Slice the STL in PETG'],
        width: 220,
      },
      {
        key: 'notes',
        label: 'Notes',
        aliases: ['description', 'details', 'opis', 'notatki', 'uwagi'],
        type: 'text',
        description: 'details, measurements, links',
        example: shopping ? ['', 'free range', ''] : ['2x NEMA 17, 0.4 Nm', '40% infill', ''],
        width: 180,
      },
      {
        key: 'status',
        label: 'Status',
        aliases: ['state', 'stan', 'etap'],
        type: 'choice',
        description: 'a column of the board of this project',
        empty: `${statuses[0]?.name ?? 'the first column'} (a value not on the list goes there too, with a warning)`,
        // The category words point at the first column of their category, so they are listed there.
        values: statuses.map((s) => ({
          value: s.name,
          group: CATEGORY_TITLE[s.category],
          aliases:
            statuses.find((first) => first.category === s.category)?.id === s.id ? CATEGORY_WORDS[s.category] : [],
        })),
        example: [statuses[0]?.name ?? 'To do', statuses[0]?.name ?? 'To do', statuses[0]?.name ?? 'To do'],
        width: 110,
      },
      {
        key: 'priority',
        label: 'Priority',
        aliases: ['priorytet', 'waznosc'],
        type: 'choice',
        description: 'how much it matters',
        empty: 'no priority',
        values: Object.values(TaskPriority).map((p) => ({ value: PRIORITY_LABEL[p], aliases: PRIORITY_WORDS[p] })),
        example: ['High', '', ''],
        width: 90,
      },
      {
        key: 'due',
        label: 'Due',
        aliases: ['due date', 'deadline', 'date', 'termin', 'data', 'do kiedy'],
        type: 'date',
        description: 'when it has to be done; an impossible date (31.02) is left out, with a warning',
        empty: 'no due date',
        example: ['2026-11-10', '2026-11-14', ''],
        width: 100,
      },
      {
        key: 'assignee',
        label: 'Assignee',
        aliases: ['owner', 'person', 'who', 'osoba', 'kto', 'odpowiedzialny'],
        type: 'person',
        description: 'who does it; only people in this project can be assigned',
        empty: 'nobody',
        values: people.map((u) => ({ value: u.email, hint: userName(u) })),
        example: ['', '', ''],
        width: 140,
      },
      {
        key: 'checklist',
        label: 'Checklist',
        aliases: ['checklista', 'kroki', 'steps', 'lista'],
        type: 'list',
        description: 'small steps inside the task, ticked off one by one',
        empty: 'no checklist',
        example: ['', 'Export STL | Slice | Print', ''],
        width: 180,
      },
      {
        key: 'parent',
        label: 'Parent',
        aliases: ['parent task', 'subtask of', 'rodzic', 'nadrzedne', 'podzadanie'],
        type: 'text',
        description: 'for a subtask: the exact title of a task higher up in the same import',
        empty: 'a task of its own, not a subtask',
        example: ['', '', 'Print the RA housing'],
        width: 160,
      },
      {
        key: 'quantity',
        label: 'Quantity',
        aliases: ['qty', 'amount', 'ilosc', 'liczba'],
        type: 'number',
        description: shopping ? 'how many to buy; more than 0' : 'how many, when it is something to buy; more than 0',
        empty: 'no quantity',
        example: shopping ? ['2', '10', '1'] : ['', '', ''],
        width: 80,
      },
      {
        key: 'unit',
        label: 'Unit',
        aliases: ['jednostka', 'jm', 'j.m.'],
        type: 'text',
        description: 'the unit of the quantity: kg, pcs, l…',
        empty: 'pieces',
        example: shopping ? ['kg', 'pcs', 'l'] : ['', '', ''],
        width: 70,
      },
    ],
    parseRow: (raw) => {
      const filled = Object.values(raw).some((v) => v.trim());
      if (!filled) return null;
      const cells: Record<string, CellResult> = {};
      let blocked = false;

      const title = (raw.title ?? '').trim();
      if (title) cells.title = ok(title);
      else {
        cells.title = err('', 'No task title');
        blocked = true;
      }
      cells.notes = ok((raw.notes ?? '').trim());

      const statusText = (raw.status ?? '').trim();
      const status = statusText ? statusOf(statusText) : undefined;
      cells.status = !statusText
        ? ok(statuses[0]?.name ?? '')
        : status
          ? ok(status.name)
          : warn(statuses[0]?.name ?? '', `"${statusText}" is not a column here — goes to ${statuses[0]?.name}`);

      const priorityText = (raw.priority ?? '').trim();
      const priority = priorityText
        ? (Object.keys(PRIORITY_WORDS) as TaskPriority[]).find(
            (p) =>
              p.toLowerCase() === fold(priorityText) || PRIORITY_WORDS[p].some((w) => fold(w) === fold(priorityText)),
          )
        : undefined;
      cells.priority = !priorityText
        ? ok('')
        : priority
          ? ok(PRIORITY_LABEL[priority])
          : warn('', `"${priorityText}" is not a priority — left out`);

      const dueText = raw.due ?? '';
      const due = toDay(dueText);
      cells.due = due === undefined ? warn('', `"${dueText}" is not a date — left out`) : ok(due ?? '');

      const assigneeText = (raw.assignee ?? '').trim();
      const person = assigneeText ? personOf(assigneeText) : undefined;
      cells.assignee = !assigneeText
        ? ok('')
        : person
          ? ok(userName(person))
          : warn('', `"${assigneeText}" is not in this project — left unassigned`);

      const checklist = splitChecklist(raw.checklist ?? '');
      cells.checklist = ok(checklist.length ? `${checklist.length}: ${checklist.join(' · ')}` : '');

      const parent = (raw.parent ?? '').trim();
      cells.parent = ok(parent);

      const quantityText = raw.quantity ?? '';
      const quantity = toNumber(quantityText);
      cells.quantity =
        quantity !== null && (Number.isNaN(quantity) || quantity <= 0)
          ? warn('', `"${quantityText}" is not a positive number — left out`)
          : ok(quantity === null ? '' : String(quantity));
      cells.unit = ok((raw.unit ?? '').trim());

      if (blocked) return { cells };
      return {
        cells,
        value: {
          title,
          notes: cells.notes.display || null,
          statusId: status?.id,
          priority,
          dueDate: due ?? null,
          assigneeId: person?.id ?? null,
          quantity: quantity !== null && !Number.isNaN(quantity) && quantity > 0 ? quantity : null,
          unit: cells.unit.display || null,
          checklist,
          parent: parent || null,
        },
      };
    },
    // A parent has to be a task further up the same import: it is created first.
    checkRows: (rows) => {
      const seen = new Set<string>();
      rows.forEach((row) => {
        const parent = row.value?.parent;
        if (parent && !seen.has(fold(parent))) {
          addIssue(
            row,
            'parent',
            { level: 'warning', message: `No task "${parent}" above it — imported as a task of its own` },
            parent,
          );
          if (row.value) row.value = { ...row.value, parent: null };
        }
        if (row.value && !row.value.parent) seen.add(fold(row.value.title));
      });
    },
  };
};
