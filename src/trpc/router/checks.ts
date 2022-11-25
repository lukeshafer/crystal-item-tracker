import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';

export const checkRouter = router({
	getAllForLocation: protectedProcedure
		.input(
			z.object({
				locationId: z.number(),
			})
		)
		.query(async ({ input, ctx }) => {
			const { roomId, userId, prisma } = ctx;
			console.log('Fetching checks for location', input.locationId);
			try {
				const checks = await prisma.check.findMany({
					where: { roomId: roomId, locationId: input.locationId },
				});
				const userChecks = await prisma.userCheck.findMany({
					where: {
						roomId: roomId,
						userId: userId,
						checkLocationId: input.locationId,
					},
				});
				const combinedCheckData = checks.map(({ id, itemId, name }) => {
					const userCheckData = userChecks.find(
						({ checkId }) => checkId === id
					)!;
					return {
						checkId: id,
						itemId,
						completed: userCheckData.completed,
						name,
					};
				});
				return {
					status: 201,
					checks: combinedCheckData,
				};
			} catch (err) {
				console.error(err);
				return { status: 500, error: 'Error fetching location' };
			}
		}),
	setCompleted: protectedProcedure
		.input(
			z.object({
				checkId: z.number(),
				locationId: z.number(),
				completed: z.boolean(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const { roomId, userId, prisma } = ctx;
			const { checkId, locationId, completed } = input;
			console.log('Setting check to ', completed);
			try {
				const result = await prisma.userCheck.update({
					where: {
						userId_checkId_roomId_checkLocationId: {
							userId,
							checkId,
							roomId,
							checkLocationId: locationId,
						},
					},
					data: {
						completed,
					},
				});
				return result;
			} catch (err) {
				console.error(err);
				return { status: 500, error: 'Error updating check' };
			}
		}),
	setItem: protectedProcedure
		.input(
			z.object({
				checkId: z.number(),
				locationId: z.number(),
				itemId: z.number().optional(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const { roomId, prisma } = ctx;
			const { checkId, locationId, itemId } = input;
			try {
				const result = await prisma.check.update({
					where: { id_roomId_locationId: { id: checkId, locationId, roomId } },
					data: { itemId: itemId ?? null },
				});
				return result.itemId;
			} catch (err) {
				console.error(err);
				return undefined;
			}
		}),
	getItem: protectedProcedure
		.input(
			z.object({
				checkId: z.number(),
				locationId: z.number(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const { roomId, prisma } = ctx;
			const { checkId, locationId } = input;
			try {
				const result = await prisma.check.findUnique({
					where: { id_roomId_locationId: { id: checkId, locationId, roomId } },
					select: { itemId: true },
				});
				return result!.itemId;
			} catch (err) {
				console.error(err);
				return undefined;
			}
		}),
});
