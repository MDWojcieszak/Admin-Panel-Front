import { PhotoEntryPostStage, PhotoEntryResponse, PhotoEntryStatus } from '~/api/api';

/**
 * The board shows one lane per meaningful (status, postStage) pair. There is no
 * column for `isHappeningNow` — the backend derives that from the dates, so it
 * is a badge on the card rather than somewhere to drag to.
 */
export type KanbanColumnId = 'PLANNED' | 'AFTER_SHOOT' | 'SELECTING' | 'EDITING' | 'FINISHED';

export type KanbanColumn = {
  id: KanbanColumnId;
  title: string;
  status: PhotoEntryStatus;
  postStage: PhotoEntryPostStage;
};

export const KANBAN_COLUMNS: KanbanColumn[] = [
  {
    id: 'PLANNED',
    title: 'Planned',
    status: PhotoEntryStatus.Planned,
    postStage: PhotoEntryPostStage.None,
  },
  // Shot with nothing done to the material yet. This is the resting state, not a
  // backlog: most entries stay here for good, so the lane is expected to be long.
  {
    id: 'AFTER_SHOOT',
    title: 'After shoot',
    status: PhotoEntryStatus.Shot,
    postStage: PhotoEntryPostStage.None,
  },
  {
    id: 'SELECTING',
    title: 'Selecting',
    status: PhotoEntryStatus.Shot,
    postStage: PhotoEntryPostStage.Selecting,
  },
  {
    id: 'EDITING',
    title: 'Editing',
    status: PhotoEntryStatus.Shot,
    postStage: PhotoEntryPostStage.Editing,
  },
  {
    id: 'FINISHED',
    title: 'Finished',
    status: PhotoEntryStatus.Shot,
    postStage: PhotoEntryPostStage.Finished,
  },
];

/** `null` for cancelled entries, which are filtered rather than shown on the board. */
export const getEntryColumn = (entry: PhotoEntryResponse): KanbanColumnId | null => {
  if (entry.status === PhotoEntryStatus.Cancelled) return null;
  if (entry.status === PhotoEntryStatus.Planned) return 'PLANNED';

  switch (entry.postStage) {
    case PhotoEntryPostStage.Selecting:
      return 'SELECTING';
    case PhotoEntryPostStage.Editing:
      return 'EDITING';
    case PhotoEntryPostStage.Finished:
      return 'FINISHED';
    default:
      return 'AFTER_SHOOT';
  }
};

export type ColumnMoveStep =
  | { op: 'status'; status: PhotoEntryStatus }
  | { op: 'postStage'; postStage: PhotoEntryPostStage };

export type ColumnMove =
  | { kind: 'noop' }
  | { kind: 'forbidden'; reason: string }
  | { kind: 'allowed'; steps: ColumnMoveStep[] };

/**
 * Both axes are patched separately and the backend rejects inconsistent pairs, so
 * the order of the two calls matters:
 *
 * - leaving `PLANNED`, the status has to become `SHOT` *before* a post-production
 *   stage is accepted (P1);
 * - returning to `PLANNED` requires the stage to be `NONE` first.
 *
 * The second direction is not offered as a single drag on purpose. Clearing the
 * stage and then failing the status call — which P13 allows, when gear is marked
 * used — would leave the entry half-moved, so dragging back to Planned is only
 * possible from "After shoot", where the stage is already `NONE` and one call does
 * it. Going further back is two deliberate drags instead of one lossy one.
 */
export const planColumnMove = (entry: PhotoEntryResponse, target: KanbanColumn): ColumnMove => {
  const from = getEntryColumn(entry);
  if (from === target.id) return { kind: 'noop' };

  if (target.id === 'PLANNED') {
    if (entry.postStage !== PhotoEntryPostStage.None) {
      return {
        kind: 'forbidden',
        reason: 'Move it to “After shoot” first — planning again drops the post-production stage.',
      };
    }
    return { kind: 'allowed', steps: [{ op: 'status', status: PhotoEntryStatus.Planned }] };
  }

  const steps: ColumnMoveStep[] = [];
  if (entry.status !== PhotoEntryStatus.Shot) {
    steps.push({ op: 'status', status: PhotoEntryStatus.Shot });
  }
  if (entry.postStage !== target.postStage) {
    steps.push({ op: 'postStage', postStage: target.postStage });
  }

  return steps.length ? { kind: 'allowed', steps } : { kind: 'noop' };
};

export const canMoveToColumn = (entry: PhotoEntryResponse, target: KanbanColumn): boolean =>
  planColumnMove(entry, target).kind === 'allowed';
