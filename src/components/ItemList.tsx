import {
	createSignal,
	For,
	type JSX,
	Match,
	onMount,
	Show,
	Switch,
} from 'solid-js';
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
import { userList } from './UserList';

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

const Item = ({ item }: { item: ItemFromApi; isHM?: boolean }) => {
	const queryClient = useQueryClient();
	let tooltip: HTMLDivElement;
	const { name, img, id } = item;
	const isCollectedQuery = createQuery(
		() => ['item.getCollectedStatus', id.toString()],
		() => client.item.getCollectedStatus.query({ itemId: id }),
		{ initialData: false }
	);

	const foundUserColors = () => {
		const colors = userList()
			.filter(
				(user) =>
					user.userItems.find((userItem) => userItem.itemId === item.id)?.found
			)
			.map((user) => user.preferences.colorValue);
		const ln = colors.length;
		if (ln > 0)
			return {
				border: '15px solid',
				'border-left-color': colors[0 % ln],
				'border-right-color': colors[1 % ln],
				'border-top-color': colors[2 % ln],
				'border-bottom-color': colors[3 % ln],
				'box-sizing': 'border-box',
			} as JSX.CSSProperties;
		return { border: 'none' } as JSX.CSSProperties;
	};

	const statusMutation = createMutation({
		mutationFn: (status: boolean) =>
			client.item.updateCollectedStatus.mutate({
				itemId: id,
				isCollected: status,
			}),
		meta: { queryKey: ['user.getUsers'] },
		onMutate: (status) => {
			queryClient.setQueryData(
				['item.getCollectedStatus', id.toString()],
				status
			);
		},
		onSettled: () => {
			queryClient.invalidateQueries(['item.getCollectedStatus', id.toString()]);
			queryClient.invalidateQueries(['user.getUsers']);
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

	const img_mods = item.img_mods?.split(',').map((mod) => {
		const [type, data] = mod.split('|');
		return { type, data };
	});
	return (
		<li class="w-max">
			<button
				class="relative w-10 box-border"
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
				<div
					class="absolute -z-10 w-full h-full inset-0"
					style={foundUserColors() ?? {}}></div>
				<img
					src={'/' + img}
					class="w-10 block inset-0"
					alt=""
					style={{
						filter: isCollectedQuery.data
							? 'none'
							: 'grayscale(100%) brightness(50%)',
					}}
				/>
				<Show when={img_mods?.length}>
					<For each={img_mods}>
						{({ type, data }) => (
							<Switch>
								<Match when={type === 'overlay'}>
									<img src={'/' + data} alt="" class="absolute inset-0" />
								</Match>
							</Switch>
						)}
					</For>
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
