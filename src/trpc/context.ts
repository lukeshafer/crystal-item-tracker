import type { inferAsyncReturnType } from '@trpc/server';
import { prisma } from '../db/client';

export const generateContextFunction =
	({ userId, roomId }: { userId: string; roomId: string }) =>
	async () => ({
		prisma,
		userId,
		roomId,
	});

export type Context = inferAsyncReturnType<
	ReturnType<typeof generateContextFunction>
>;
