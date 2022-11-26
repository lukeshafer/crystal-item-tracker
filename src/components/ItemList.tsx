import { createResource, createSignal, For, onMount, Show } from 'solid-js';
import { Portal } from 'solid-js/web';
import type { Item } from '../lib/item-data';
import { HoverBox } from './Tracker';
import { client } from '../lib/trpc-client';

export const selectedItemSignal = createSignal<{
	src: string;
	id: number;
	name: string;
}>();
const [selectedItem, setSelectedItem] = selectedItemSignal;

export interface Props {
	items: Item[];
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

const Item = ({ item, isHM }: { item: Item; isHM?: boolean }) => {
	isHM ??= false;
	let tooltip: HTMLDivElement;
	const { name, img, id } = item;
	const [collectedStatus, { mutate }] = createResource(() =>
		client.item.getCollectedStatus.query({ itemId: id })
	);

	const updateCollectedStatus = (status: boolean) => {
		setSelectedItem(status ? { id, src: img, name } : undefined);
		client.item.updateCollectedStatus.mutate({
			itemId: id,
			isCollected: status,
		});
		mutate(status);
	};

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
						filter: collectedStatus()
							? 'none'
							: 'grayscale(100%) brightness(50%)',
					}}
				/>
				<Show when={isHM}>
					<p class="absolute bottom-0 left-0">{name.split(' ')[0]}</p>
				</Show>
				<HoverBox ref={tooltip!}>{name}</HoverBox>
				<Show when={selectedItem()?.id === id}>
					<MouseItem src={'/' + img} />
				</Show>
			</button>
		</li>
	);
};

const Marker = ({ item }: { item: Item }) => {
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

export const ItemList = ({ items }: { items: Item[] }) => {
	const markers = items.filter((item) => item.codes === 'marker');
	const hms = items.filter(
		(item) =>
			['TM', 'HM'].includes(item.name.substring(0, 2)) &&
			!markers.includes(item)
	);
	const badges = items.filter(
		(item) =>
			item.name.toLowerCase().includes('badge') &&
			![...hms, ...markers].includes(item)
	);
	const otherItems = items.filter(
		(item) => ![...badges, ...hms, ...markers].includes(item)
	);

	return (
		<section class="grid gap-4 content-start">
			<ul class="grid grid-cols-8 gap-x-2 w-max">
				<For each={otherItems}>{(item) => <Item item={item} />}</For>
			</ul>
			<ul class="grid grid-cols-8 gap-x-2 w-max">
				<For each={hms}>{(item) => <Item item={item} isHM />}</For>
			</ul>
			<ul class="grid grid-cols-8 gap-x-2 w-max">
				<For each={badges}>{(item) => <Item item={item} />}</For>
			</ul>
			<ul class="flex gap-x-2 w-full justify-evenly">
				<For each={markers}>{(item) => <Marker item={item} />}</For>
			</ul>
		</section>
	);
};
