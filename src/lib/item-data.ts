import { z } from 'zod';
import itemData from '../../tracker-data/items/items.json';
import badgeData from '../../tracker-data/items/badges.json';

const markerData = [
	{
		name: 'Money Item',
		type: 'marker',
		img: 'images/other/trophy.png',
		codes: 'marker',
	},
	{
		name: 'TM',
		type: 'marker',
		img: 'images/chests/tm_hm_unopened.png',
		codes: 'marker',
	},
	{
		name: 'Healing',
		type: 'marker',
		img: 'images/other/elm.png',
		codes: 'marker',
	},
];

const fullItemData = [...itemData, ...badgeData, ...markerData];

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
			z.object({
				name: z.string(),
				type: z.literal('marker'),
				img: z.string(),
				img_mods: z.undefined(),
				codes: z.string(),
				stages: z.undefined(),
			}),
		])
	)
	.transform((items) =>
		items
			.reduce((accum, item) => {
				const prevIndex = accum.at(-1)?.id ?? 0;
				let index = prevIndex + 1;
				const { name, codes, img, stages, img_mods } = item;
				if (stages) {
					const returnStages = stages.map((stage, stageIndex) => ({
						name,
						...stage,
						id: index + stageIndex,
					}));
					return [...accum, ...returnStages];
				}
				return [...accum, { name, codes, img, id: index, img_mods }];
			}, [] as { id: number; name: string; codes: string; img: string; img_mods?: string | undefined }[])
			.flat()
	);

const items = itemsSchema.parse(fullItemData);
export const getItemData = () => items.slice();
