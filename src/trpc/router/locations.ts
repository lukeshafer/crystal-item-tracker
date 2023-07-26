import type { Location } from '@prisma/client';
import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';

const filterAccessibleLocations = (locations: Location[], progressCodes: string[]) => {
	return locations.filter((location) => {
		if (location.accessRules === null) return true;
		const accessRules = z.array(z.string()).safeParse(JSON.parse(location.accessRules));
		if (!accessRules.success) return false;
		return accessRules.data.some((rule) => {
			const ruleList = rule.split(',');
			return ruleList.every((code) => progressCodes.includes(code));
		})
	})
}

const updateProgressWithLocations = (accessibleLocations: Location[], progressCodes: string[]) => {
	const progressCodesWithoutLocations = progressCodes.filter((code) => code.substring(0, 1) !== "@");
	const locationCodes = accessibleLocations.map((location) => `@${location.name}`);

	return [...progressCodesWithoutLocations, ...locationCodes];
}

export const locationRouter = router({
	getAll: protectedProcedure.query(async ({ ctx }) => {
		const { roomId, userId, prisma } = ctx;
		try {
			const user = await prisma.user.findUnique({
				where: { id: userId },
				select: { progressCodes: true },
			});
			if (!user) throw new Error('User not found');
			const progressCodeData = z.array(z.string()).safeParse(JSON.parse(user.progressCodes));
			if (!progressCodeData.success) throw new Error('Invalid progress codes');
			const progressCodes = progressCodeData.data;

			const locations = await prisma.location.findMany({
				where: { roomId: roomId },
			});
			const accessibleLocations = filterAccessibleLocations(locations, progressCodes);
			const newProgressCodes = updateProgressWithLocations(accessibleLocations, progressCodes);
			await prisma.user.update({
				where: { id: userId },
				data: { progressCodes: JSON.stringify(newProgressCodes) },
			});

			return {
				status: 201,
				locations: accessibleLocations.map(({ id, name, x, y }) => ({
					id,
					name,
					x,
					y,
				})),
			};
		} catch (err) {
			return { status: 500, error: 'Error creating user' };
		}
	}),
});
