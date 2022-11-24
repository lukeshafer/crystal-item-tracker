import { itemUnderCursorSignal, itemDisplayListSignal } from '../lib/state';
import {
	createEffect,
	createResource,
	createSignal,
	For,
	onMount,
	Show,
} from 'solid-js';
import { currentLocationSignal } from './Locations';
import type { Item } from '../lib/item-data';
import { client } from '../lib/trpc-client';

const [selectedItem, setSelectedItem] = itemUnderCursorSignal;
const [itemDisplayList] = itemDisplayListSignal;

interface ItemCheckProps {
	name: string;
	checkId: number;
	completed: boolean;
	locationId: number;
}
const ItemCheck = ({ value }: { value: ItemCheckProps }) => {
	const { name, checkId, completed, locationId } = value;
	const isCheckedSignal = createSignal(completed);
	const [isChecked, setIsChecked] = isCheckedSignal;

	const setCheckbox = (value: boolean) => {
		setIsChecked(value);
		client.checks.setCompleted.mutate({
			completed: value,
			checkId,
			locationId,
		});
	};

	const [itemAtLocation, setItemAtLocation] = createSignal<Item | undefined>();

	let checkbox: HTMLInputElement;
	let unchecking = false;
	const handleCheck = (e: MouseEvent) => {
		if (checkbox.checked) {
			setCheckbox(true);
		} else if (!unchecking) {
			e.preventDefault();
		} else {
			setCheckbox(false);
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

	return (
		<li class="flex gap-3 text-2xl">
			<input
				ref={checkbox!}
				type="checkbox"
				name="check"
				id={name + '-check'}
				onClick={(e) => handleCheck(e)}
				onContextMenu={handleRightClick}
				checked={isChecked()}
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

export const CheckList = () => {
	const [currentLocation] = currentLocationSignal;

	const [checkData] = createResource(currentLocation, (currentLocation) => {
		return client.checks.getAllForLocation.query({
			locationId: currentLocation.id,
		});
	});

	return (
		<section class="p-4 h-full bg-gray-800 text-white">
			<Show when={currentLocation() !== undefined}>
				<h2 class="text-3xl">{currentLocation()?.name}</h2>
				<ul class="p-4 grid gap-4">
					<For each={checkData()?.checks ?? []}>
						{(check) => (
							<ItemCheck
								value={{
									name: check.name,
									locationId: currentLocation()!.id,
									completed: check.completed,
									checkId: check.checkId,
								}}
							/>
						)}
					</For>
				</ul>
			</Show>
		</section>
	);
};
