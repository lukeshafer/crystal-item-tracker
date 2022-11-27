import { createSignal, For, onMount, Show } from 'solid-js';
import { Portal } from 'solid-js/web';
import { createStore } from 'solid-js/store';
import { HoverBox } from './Tracker';
import { client } from '../lib/trpc-client';
import {
	createMutation,
	createQuery,
	useQueryClient,
} from '@tanstack/solid-query';
import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '../trpc/router/_index';

export type ItemFromApi =
	inferRouterOutputs<AppRouter>['item']['getAll'][number];

const [itemListState, setItemListState] = createStore<ItemFromApi[]>([]);
export const itemList = {
	getItem: (id: number) => itemListState.find((item) => item.id === id),
	setAtIndex: (id: number, newItem: ItemFromApi) => {
		setItemListState((list) =>
			list.map((item) => (item.id === id ? newItem : item))
		);
	},
};

export const selectedItemSignal = createSignal<{
	src: string;
	id: number;
	name: string;
}>();
const [selectedItem, setSelectedItem] = selectedItemSignal;

export interface Props {
	items: ItemFromApi[];
}

const MouseItem = ({ src }: { src: string }) => {
	const [mousePositions, setMousePositions] = createSignal([0, 0]);
	onMount(() => {
		document.onmousemove = ({ x, y }) => {
			setMousePositions([x, y]);
		};
	});
	return (
		<Portal>
			<img
				src={src}
				class="absolute left-2 top-2 w-6"
				style={{
					transform: `translate(${mousePositions()[0]}px, ${
						mousePositions()[1]
					}px)`,
				}}
			/>
		</Portal>
	);
};

const Item = ({ item, isHM }: { item: ItemFromApi; isHM?: boolean }) => {
	isHM ??= false;
	const queryClient = useQueryClient();
	let tooltip: HTMLDivElement;
	const { name, img, id } = item;
	const isCollectedQuery = createQuery(
		() => ['item.getCollectedStatus', id.toString()],
		() => client.item.getCollectedStatus.query({ itemId: id }),
		{ initialData: false }
	);

	const statusMutation = createMutation({
		mutationFn: (status: boolean) =>
			client.item.updateCollectedStatus.mutate({
				itemId: id,
				isCollected: status,
			}),
		meta: { queryKey: ['item.getCollectedStatus', id.toString()] },
		onMutate: (status) => {
			queryClient.setQueryData(
				['item.getCollectedStatus', id.toString()],
				status
			);
		},
		onSettled: () => {
			queryClient.invalidateQueries(['item.getCollectedStatus', id.toString()]);
		},
	});

	const updateCollectedStatus = (status: boolean) => {
		setSelectedItem(status ? { id, src: img, name } : undefined);
		statusMutation.mutate(status);
	};

	const itemCheckInfo = createQuery(
		() => ['item.getCheckInfo', item.id],
		() => client.item.getCheckInfo.query({ itemId: id })
	);

	const showTooltip = () => (tooltip.style.visibility = 'visible');
	const hideTooltip = () => (tooltip.style.visibility = 'hidden');
	return (
		<li class="w-max">
			<button
				class="relative w-max"
				onClick={() => {
					updateCollectedStatus(true);
				}}
				onContextMenu={(e) => {
					e.preventDefault();
					updateCollectedStatus(false);
				}}
				onMouseEnter={showTooltip}
				onMouseLeave={hideTooltip}
				onFocus={showTooltip}
				onBlur={hideTooltip}>
				<img
					src={'/' + img}
					class="w-10 block"
					alt=""
					style={{
						filter: isCollectedQuery.data
							? 'none'
							: 'grayscale(100%) brightness(50%)',
					}}
				/>
				<Show when={isHM}>
					<p class="absolute bottom-0 left-0">{name.split(' ')[0]}</p>
				</Show>
				<HoverBox ref={tooltip!}>
					<p>{name}</p>
					<Show when={itemCheckInfo.data?.locationName}>
						<i>Found at {itemCheckInfo.data?.locationName}</i>
						<br />
						<i>{itemCheckInfo.data?.checkName}</i>
					</Show>
				</HoverBox>
				<Show when={selectedItem()?.id === id}>
					<MouseItem src={'/' + img} />
				</Show>
			</button>
		</li>
	);
};

const Marker = ({ item }: { item: ItemFromApi }) => {
	const { name, img, id } = item;
	return (
		<li class="w-max">
			<button
				class="grid justify-center place-items-center"
				onClick={() => {
					console.log('clicked');
					setSelectedItem({ id, src: img, name });
				}}>
				<img src={'/' + item.img} class="w-10 block" alt="" />
				<p class="">{item.name}</p>
				<Show when={selectedItem()?.id === id}>
					<MouseItem src={'/' + img} />
				</Show>
			</button>
		</li>
	);
};

export const ItemList = ({ items }: { items: ItemFromApi[] }) => {
	setItemListState(items);

	const otherItems = items.filter((item) => item.type === 'GENERAL');
	const hmItems = items.filter((item) => item.type === 'HM');
	const badgeItems = items.filter((item) => item.type === 'BADGE');
	const markers = items.filter((item) => item.type === 'MARKER');

	return (
		<section class="grid gap-4 content-start">
			<ul class="grid grid-cols-8 gap-x-2 w-max">
				<For each={otherItems}>{(item) => <Item item={item} />}</For>
			</ul>
			<ul class="grid grid-cols-8 gap-x-2 w-max">
				<For each={hmItems}>{(item) => <Item item={item} isHM />}</For>
			</ul>
			<ul class="grid grid-cols-8 gap-x-2 w-max">
				<For each={badgeItems}>{(item) => <Item item={item} />}</For>
			</ul>
			<ul class="flex gap-x-2 w-full justify-evenly">
				<For each={markers}>{(item) => <Marker item={item} />}</For>
			</ul>
		</section>
	);
};
