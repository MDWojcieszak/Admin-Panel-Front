import { CommandRuntimeStatus, CommandStatus, ProcessLogLevel, ServerProcessStatus } from '~/api/api';

/** Payloads for the server-related socket.io events (see backend brief §5). */

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
