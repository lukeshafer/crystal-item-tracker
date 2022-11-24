import { createSignal, For, onMount, Show } from 'solid-js';
import { Portal } from 'solid-js/web';
import type { Item } from '../lib/item-data';
import { HoverBox } from './Tracker';
import { itemUnderCursorSignal, itemDisplayListSignal } from '../lib/state';
import { client } from '../lib/trpc-client';

const [selectedItem, setSelectedItem] = itemUnderCursorSignal;
const [itemDisplayList, setItemDisplayList] = itemDisplayListSignal;

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

const Item = ({ item, index }: { item: Item; index: number }) => {
	let tooltip: HTMLDivElement;
	const { name, img } = item;
	const showTooltip = () => (tooltip.style.visibility = 'visible');
	const hideTooltip = () => (tooltip.style.visibility = 'hidden');
	return (
		<li class="w-max">
			<button
				class="relative w-max"
				onClick={() => {
					setSelectedItem(index);
					setItemDisplayList((val) => {
						const newValue = val.slice();
						newValue.splice(index, 1, { ...item, selected: true });
						return newValue;
					});
				}}
				onContextMenu={(e) => {
					e.preventDefault();
					//itemDisplayList()[index]!.selected = false;
					setItemDisplayList((val) => {
						const newValue = val.slice();
						newValue.splice(index, 1, { ...item, selected: false });
						return newValue;
					});
					setSelectedItem();
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
						filter: itemDisplayList()[index]!.selected
							? 'none'
							: 'grayscale(100%) brightness(50%)',
					}}
				/>
				<HoverBox ref={tooltip!}>{name}</HoverBox>
				<Show when={selectedItem() === index}>
					<MouseItem src={'/' + img} />
				</Show>
			</button>
		</li>
	);
};

export const ItemList = () => {
	return (
		<section>
			<ul class="grid grid-cols-8 gap-x-2 w-max">
				<For each={itemDisplayList()}>
					{(item, index) => <Item item={item} index={index()} />}
				</For>
			</ul>
		</section>
	);
};
