import { CommandRuntimeStatus, CommandStatus, ProcessLogLevel, ServerProcessStatus, ServerStatus } from '~/api/api';

/** Payloads for the server-related socket.io events (see backend brief §5). */

/**
 * `server.status` — emitted on every server lifecycle transition (start/stop/reboot,
 * entering online, offline-timeout, wake-timeout). Render straight from this payload;
 * the only local state needed is a 1s tick to advance the wake-progress bar from `since`.
 */
export type ServerStatusPayload = {
  serverId: string;
  status: ServerStatus;
  isOnline: boolean;
  /** ISO — when the status took effect; used to compute elapsed/progress. */
  since: string;
  /** Wake deadline in ms (e.g. 120000) — denominator of the wake-progress bar. */
  wakeTimeoutMs: number;
};

export type ServerCommandUpdatePayload = {
  commandId: string;
  status?: CommandStatus;
  runtimeStatus: CommandRuntimeStatus;
  runningProgress: number;
};

export type ProcessCreatedPayload = {
  processId: string;
  name: string;
  status: ServerProcessStatus;
  progress: number;
  categoryId: string;
  commandId: string;
};

export type ProcessLogPayload = {
  processId: string;
  id: string;
  message: string;
  level: ProcessLogLevel;
  timestamp: string;
};

export type ProcessProgressPayload = {
  processId: string;
  progress: number;
  label?: string;
};

export type ProcessStatusPayload = {
  processId: string;
  status: ServerProcessStatus;
  progress: number;
};

export type ProcessDeletedPayload = {
  processId: string;
};
