import { z } from 'zod';
import { api } from '~/adapters/api';
import { ApiTag } from '~/api/types';

const CommandType = z.object({
  id: z.string(),
  name: z.string().optional().nullable(),
  value: z.string(),
});
export type CommandType = z.infer<typeof CommandType>;

const CommandResponse = z.array(CommandType);
export type CommandResponse = z.infer<typeof CommandResponse>;

export const ServerCommandsService = {
  tag: ApiTag.SERVER_COMMANDS,

  async getAll(categoryId: string): Promise<CommandResponse> {
    try {
      const response = await api(ServerCommandsService.tag).get('all', { body: { categoryId } });
      return CommandResponse.parse(response);
    } catch (error) {
      console.error('Error getting server commands list:', error);
      throw error;
    }
  },
};
