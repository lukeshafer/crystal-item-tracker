import { z } from 'zod';
import { router, publicProcedure } from '../trpc';

export const itemsRouter = router({
	createUserItem: publicProcedure
		.input(
			z.object({
				itemId: z.number(),
				userId: z.string(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const result = await ctx.prisma.userItem.update({
				where: {
					userId_itemId: { userId: input.userId, itemId: input.itemId },
				},
				data: {
					found: input.found,
				},
			});
			if (result) return { success: true };
			else return { success: false };
		}),
	updateCollectedStatus: publicProcedure
		.input(
			z.object({
				itemId: z.number(),
				userId: z.string(),
				found: z.boolean(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const result = await ctx.prisma.userItem.update({
				where: {
					userId_itemId: { userId: input.userId, itemId: input.itemId },
				},
				data: {
					found: input.found,
				},
			});
			if (result) return { success: true };
			else return { success: false };
		}),
});
