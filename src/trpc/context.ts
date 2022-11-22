import type { inferAsyncReturnType } from '@trpc/server';
import { prisma } from '../db/client';

export const createContext = async () => ({ prisma });

export type Context = inferAsyncReturnType<typeof createContext>;
