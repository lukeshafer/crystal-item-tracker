import { z } from 'zod';
import itemData from '../../tracker-data/items/items.json';
import badgeData from '../../tracker-data/items/badges.json';

const fullItemData = [...itemData, ...badgeData];

const itemsSchema = z
	.array(
		z.union([
			z.object({
				name: z.string(),
				type: z.literal('toggle'),
				img: z.string(),
				img_mods: z.string().optional(),
				codes: z.string(),
				stages: z.undefined(),
			}),
			z.object({
				name: z.string(),
				type: z.literal('progressive'),
				img: z.undefined(),
				img_mods: z.undefined(),
				codes: z.undefined(),
				stages: z.array(
					z.object({
						img: z.string(),
						codes: z.string(),
					})
				),
			}),
		])
	)
	.transform((items) =>
		items
			.reduce((accum, item) => {
				const prevIndex = accum.at(-1)?.id ?? -1;
				let index = prevIndex + 1;
				const { name, codes, img, stages } = item;
				if (stages) {
					const returnStages = stages.map((stage, stageIndex) => ({
						name,
						...stage,
						id: index + stageIndex,
					}));
					return [...accum, ...returnStages];
				}
				return [...accum, { name, codes, img, id: index }];
			}, [] as { id: number; name: string; codes: string; img: string }[])
			.flat()
	);

const items = itemsSchema.parse(fullItemData);
export const getItemData = () => items.slice();

export type Item = typeof items[number];
