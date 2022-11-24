import { itemUnderCursorSignal } from '../lib/state';
import type { Component, ParentProps } from 'solid-js';
import { LocationsOnMap, type Props as LocationProps } from './Locations';
import { ItemList } from '../components/ItemList';
import { CheckList } from './CheckList';

const [, setSelectedItem] = itemUnderCursorSignal;

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

export type Props = { roomId: string; userId: string } & ParentProps &
	LocationProps;

export const Tracker: Component<Props> = ({
	locations,
	children,
	positionModifier,
}: Props) => {
	return (
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
				<ItemList />
			</div>
			<CheckList />
		</main>
	);
};
