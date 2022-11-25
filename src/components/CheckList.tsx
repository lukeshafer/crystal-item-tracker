import { createSignal, For, Match, Show, Switch } from 'solid-js';
import { currentLocationSignal } from './Locations';
import { selectedItemSignal } from './ItemList';
import { client } from '../lib/trpc-client';
import { getItemData } from '../lib/state';
import {
	createMutation,
	createQuery,
	useQueryClient,
} from '@tanstack/solid-query';
import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '../trpc/router/_index';

type Checks = inferRouterOutputs<AppRouter>['checks']['getAllForLocation'];

const [selectedItem, setSelectedItem] = selectedItemSignal;

interface ItemCheckProps {
	name: string;
	checkId: number;
	completed: boolean;
	locationId: number;
	itemId: number | null;
}
const ItemCheck = ({ value }: { value: ItemCheckProps }) => {
	const queryClient = useQueryClient();
	const { name, checkId, completed, locationId, itemId } = value;

	const [isChecked, setIsChecked] = createSignal(completed);
	const checkboxMutation = createMutation({
		mutationFn: (isChecked: boolean) =>
			client.checks.setCompleted.mutate({
				completed: isChecked,
				checkId,
				locationId,
			}),
		mutationKey: ['updateItem'],
		onSettled: () => {
			queryClient.invalidateQueries(['checks', locationId]);
		},
	});

	const [itemData, setItemData] = createSignal(
		itemId !== null ? getItemData()[itemId] : undefined
	);
	const checkItemMutation = createMutation({
		mutationFn: (itemId?: number) =>
			client.checks.setItem.mutate({
				itemId,
				checkId,
				locationId,
			}),
		mutationKey: ['updateItem'],
		onMutate: async (newItemId) => {
			setItemData(
				newItemId !== undefined ? getItemData()[newItemId] : undefined
			);
		},
		onSettled: () => {
			queryClient.invalidateQueries(['checks', locationId]);
		},
	});

	const setCheckbox = (value: boolean) => {
		setIsChecked(value);
		checkboxMutation.mutate(value);
	};

	let checkbox: HTMLInputElement;
	let unchecking = false;
	const handleCheck = (e: MouseEvent) => {
		if (checkbox.checked) {
			setCheckbox(true);
		} else if (!unchecking) {
			e.preventDefault();
		} else {
			setCheckbox(false);
			unchecking = false;
		}
		if (selectedItem()) {
			checkItemMutation.mutate(selectedItem()!.id);
			setSelectedItem(undefined);
		}
	};

	const handleRightClick = () => {
		if (checkbox.checked) {
			unchecking = true;
			checkbox.click();
		} else {
			checkItemMutation.mutate(undefined);
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
			<Show when={itemData()}>
				<img
					src={'/' + itemData()!.img}
					class="w-6 h-6"
					alt={itemData()!.name}
				/>
			</Show>
		</li>
	);
};

export const CheckList = () => {
	const [currentLocation] = currentLocationSignal;

	const checksQuery = createQuery(
		() => ['checks', currentLocation()?.id],
		() =>
			client.checks.getAllForLocation.query({
				locationId: currentLocation()!.id,
			}),
		{ refetchInterval: 1000 }
	);

	return (
		<section class="p-4 h-full bg-gray-800 text-white">
			<Show when={currentLocation() !== undefined}>
				<h2 class="text-3xl">{currentLocation()?.name}</h2>
				<Switch>
					<Match when={checksQuery.isLoading}>
						<p>Loading...</p>
					</Match>

					<Match when={checksQuery.isSuccess}>
						<ul class="p-4 grid gap-4">
							<For each={checksQuery.data?.checks ?? []}>
								{(check) => (
									<ItemCheck
										value={{
											name: check.name,
											locationId: currentLocation()!.id,
											completed: check.completed,
											checkId: check.checkId,
											itemId: check.itemId,
										}}
									/>
								)}
							</For>
						</ul>
					</Match>
				</Switch>
			</Show>
		</section>
	);
};
