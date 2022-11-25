import type { Component, ParentProps } from 'solid-js';
import type { Item } from '../lib/item-data';
import { LocationsOnMap, type Props as LocationProps } from './Locations';
import { ItemList, selectedItemSignal } from '../components/ItemList';
import { CheckList } from './CheckList';
import { RoomContextProvider } from './RoomContext';
import { setItemData } from '../lib/state';
import { QueryClient, QueryClientProvider } from '@tanstack/solid-query';

const [, setSelectedItem] = selectedItemSignal;

interface HoverBoxProps extends ParentProps {
	class?: string;
	ref: HTMLDivElement;
}
export const HoverBox = ({
	class: className,
	children,
	ref: tooltip,
}: HoverBoxProps) => {
	return (
		<div
			onMouseEnter={({ currentTarget }) => {
				currentTarget.style.visibility = 'hidden';
			}}
			ref={tooltip!}
			class={`absolute left-full top-full invisible z-10 bg-slate-900 text-white border border-white w-max ${
				className ?? ''
			}`}>
			{children}
		</div>
	);
};

export type Props = { items: Item[] } & ParentProps & LocationProps;

export const Tracker: Component<Props> = ({
	locations,
	children,
	positionModifier,
	items,
}: Props) => {
	setItemData(items);
	const queryClient = new QueryClient();
	return (
		<QueryClientProvider client={queryClient}>
			<main
				onContextMenu={(e) => {
					e.preventDefault();
					setSelectedItem();
				}}>
				<div class="flex flex-wrap">
					<section id="map" class="relative w-[600px] h-min block">
						{children}
						<LocationsOnMap
							locations={locations}
							positionModifier={positionModifier}
						/>
					</section>
					<ItemList items={items} />
				</div>
				<CheckList />
			</main>
		</QueryClientProvider>
	);
};
