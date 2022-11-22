import { z } from 'zod';
const locationFiles = import.meta.glob('../../tracker-data/locations/*.json');
const locationData = await Promise.all(
	Object.values(locationFiles).map((file) => file())
);

const locationSchema = z
	.array(
		z.object({
			default: z.array(
				z.object({
					name: z.string(),
					sections: z
						.array(
							z
								.object({
									name: z.string(),
									access_rules: z.array(z.string()).optional(),
									visibility_rules: z.array(z.string()).optional(),
									clear_as_group: z.boolean().optional(),
									chest_unopened_img: z.string().optional(),
									chest_opened_img: z.string().optional(),
									item_count: z.number().optional(),
									hosted_item: z.string().optional(),
								})
								.passthrough()
						)
						.optional(),
					map_locations: z
						.array(z.object({ map: z.string(), x: z.number(), y: z.number() }))
						.optional(),
				})
			),
		})
	)
	.transform(
		(locations) =>
			new Map(
				locations
					.filter(
						(location) =>
							location.default.filter((obj) => obj.map_locations).length > 0
					)
					.map((value) => value.default)
					.flat()
					.map((loc) => [loc.name, { ...loc }] as [string, typeof loc])
					.sort(([, loc1], [, loc2]) => {
						const { map_locations: map1 } = loc1;
						const { map_locations: map2 } = loc2;
						if (map1![0]!.x === map2![0]!.x) return map1![0]!.y - map2![0]!.y;
						return map1![0]!.x - map2![0]!.x;
					})
			)
	);

export type LocationMap = z.infer<typeof locationSchema>;
export type Location = LocationMap extends Map<string, infer I> ? I : never;

const locations = locationSchema.parse(locationData);

export const getLocations = () => {
	return new Map(locations);
};
