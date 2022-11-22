import {
	locationSignal,
	itemUnderCursorSignal,
	itemDisplayListSignal,
} from '../lib/state';
import {
	Component,
	createContext,
	createSignal,
	For,
	onMount,
	ParentProps,
	Show,
} from 'solid-js';
import { LocationsOnMap, type Props as LocationProps } from './Locations';
import { ItemList } from '../components/ItemList';
import type { Item } from '$/lib/item-data';
import { client } from '../lib/trpc-client';

const [selectedItem, setSelectedItem] = itemUnderCursorSignal;
const [itemDisplayList] = itemDisplayListSignal;

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
			class={`absolute left-full top-full invisible z-10 bg-slate-900 text-white border border-white w-max ${className ?? ''
				}`}>
			{children}
		</div>
	);
};

const ItemCheck = ({ name }: { name: string }) => {
	const [isChecked, setIsChecked] = createSignal(false);
	const [itemAtLocation, setItemAtLocation] = createSignal<Item | undefined>();

	let checkbox: HTMLInputElement;
	let unchecking = false;
	const handleCheck = (e: MouseEvent) => {
		if (checkbox.checked) {
			setIsChecked(true);
		} else if (!unchecking) {
			e.preventDefault();
		} else {
			setIsChecked(false);
			setItemAtLocation();
			unchecking = false;
		}
		if (selectedItem()) {
			setItemAtLocation(itemDisplayList()[selectedItem()!]);
			setSelectedItem();
		}
	};

	const handleRightClick = () => {
		if (checkbox.checked) {
			unchecking = true;
			checkbox.click();
		}
	};

	onMount(() => {
		setIsChecked(checkbox.checked);
	});

	return (
		<li class="flex gap-3 text-2xl">
			<input
				ref={checkbox!}
				type="checkbox"
				name="check"
				id={name + '-check'}
				onClick={(e) => handleCheck(e)}
				onContextMenu={handleRightClick}
			/>
			<label
				for={name + '-check'}
				onContextMenu={handleRightClick}
				classList={{ 'text-gray-500': isChecked() }}>
				{name}
			</label>
			<Show when={itemAtLocation()}>
				<img
					src={'/' + itemAtLocation()!.img}
					class="w-6 h-6"
					alt={itemAtLocation()!.name}
				/>
			</Show>
		</li>
	);
};

const CurrentLocation = () => {
	const [currentLocation] = locationSignal;
	return (
		<section class="p-4 h-full bg-gray-800 text-white">
			<h2 class="text-3xl">{currentLocation().name}</h2>
			<ul class="p-4 grid gap-4">
				<For each={currentLocation().sections}>
					{({ name }) => <ItemCheck name={name} />}
				</For>
			</ul>
		</section>
	);
};

export type Props = { roomId: string } & ParentProps & LocationProps;

export const NameInput = () => {
	let input: HTMLInputElement;
	const submitName = (name: string) => {
		client.user.createUser.mutate({ name, roomId: 'hhhh' });
	};

	return (
		<form action="">
			<input type="text" ref={input!} name="userName" placeholder="Name" />
			<button onClick={() => submitName(input.value)}>Submit</button>
		</form>
	);
};

const RoomIdContext = createContext<string>();
// TODO: create context provider, then wrap the tracker contents with the provider
// export "useRoomId" which accesses the room ID context value

export const Tracker: Component<Props> = ({
	locations,
	children,
	positionModifier,
	roomId,
}: Props) => {
	const userId = localStorage.getItem('userId');
	return (
		<main
			onContextMenu={(e) => {
				e.preventDefault();
				setSelectedItem();
			}}>
			<Show when={userId !== null}>
				<NameInput />
			</Show>
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
			<CurrentLocation />
		</main>
	);
};
