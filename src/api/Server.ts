import { z } from 'zod';
import { api } from '~/adapters/api';
import { ApiTag } from '~/api/types';

const DiskType = z.object({
  available: z.number(),
  fs: z.string(),
  id: z.string(),
  mediaType: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  type: z.string(),
  used: z.number(),
});
export type DiskType = z.infer<typeof DiskType>;

const MemoryType = z.object({
  free: z.number(),
  id: z.string(),
  total: z.number(),
});
export type MemoryType = z.infer<typeof MemoryType>;

const CpuType = z.object({
  cores: z.number(),
  physicalCores: z.number(),
  currentLoad: z.number(),
  currentLoadSystem: z.number(),
  currentLoadUser: z.number(),
  id: z.string(),
});
export type CpuType = z.infer<typeof CpuType>;

const ServerPropertiesType = z.object({
  status: z.string(),
  uptime: z.number(),
  diskInfo: z.array(DiskType),
  memoryInfo: MemoryType,
  cpuInfo: CpuType,
});
export type ServerPropertiesType = z.infer<typeof ServerPropertiesType>;

const ServerCategoriesType = z.object({
  id: z.string(),
  name: z.string().optional().nullable(),
  value: z.string(),
});
export type ServerCategoriesType = z.infer<typeof ServerCategoriesType>;

const CategoriesResponse = z.array(ServerCategoriesType);
export type CategoriesResponse = z.infer<typeof CategoriesResponse>;

const ServerType = z.object({
  id: z.string(),
  name: z.string(),
  ipAddress: z.string(),
  location: z.string().optional().nullable(),
  properties: ServerPropertiesType,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type ServerType = z.infer<typeof ServerType>;

const ServerDataResponse = z.object({
  total: z.number(),
  servers: z.array(ServerType),
});

export type ServerDataResponse = z.infer<typeof ServerDataResponse>;

export const ServerService = {
  tag: ApiTag.SERVER,

  async getAll(): Promise<ServerDataResponse> {
    try {
      const response = await api(ServerService.tag).get('all');
      return ServerDataResponse.parse(response);
    } catch (error) {
      console.error('Error getting server list:', error);
      throw error;
    }
  },

  async getCategories(serverId: string): Promise<CategoriesResponse> {
    try {
      const response = await api(ServerService.tag).get('categories', { body: { id: serverId } });
      return CategoriesResponse.parse(response);
    } catch (error) {
      console.error('Error getting server categories list:', error);
      throw error;
    }
  },
};
