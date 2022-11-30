import { createSignal, For, Match, Show, Switch } from 'solid-js';
import { currentLocationSignal } from './Locations';
import { itemList, selectedItemSignal } from './ItemList';
import { client } from '../lib/trpc-client';
import {
	createMutation,
	createQuery,
	useQueryClient,
} from '@tanstack/solid-query';
import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '../trpc/router/_index';

export type Checks = NonNullable<
	inferRouterOutputs<AppRouter>['checks']['getAllForLocation']['checks']
>[number];

const [selectedItem, setSelectedItem] = selectedItemSignal;

interface ItemCheckProps {
	name: string;
	checkId: number;
	completed: boolean;
	locationId: number;
}
const ItemCheck = ({ value }: { value: ItemCheckProps }) => {
	const queryClient = useQueryClient();
	const { name, checkId, completed, locationId } = value;

	const [isChecked, setIsChecked] = createSignal(completed);
	createQuery(
		() => ['checks.getCompleted', locationId.toString(), checkId.toString()],
		() => client.checks.getCompleted.query({ checkId, locationId })
	);
	const checkboxMutation = createMutation({
		mutationFn: (isChecked: boolean) =>
			client.checks.setCompleted.mutate({
				completed: isChecked,
				checkId,
				locationId,
			}),
		onSettled: () => {
			queryClient.invalidateQueries([
				'checks.getCompleted',
				locationId.toString(),
				checkId.toString(),
			]);
		},
	});

	const checkItemQuery = createQuery(
		() => ['checks.getItem', locationId.toString(), checkId.toString()],
		() => client.checks.getItem.query({ checkId, locationId })
	);
	const checkItemMutation = createMutation({
		mutationFn: (itemId?: number) =>
			client.checks.setItem.mutate({
				itemId,
				checkId,
				locationId,
			}),
		meta: { queryKey: ['checks'] },
		onMutate(itemId) {
			queryClient.setQueryData(
				['checks.getItem', locationId.toString(), checkId.toString()],
				itemId
					? {
						itemId,
						itemName: itemList.getItem(itemId)?.name,
						itemImg: itemList.getItem(itemId)?.img,
					}
					: null
			);
		},
		onSettled: () => {
			queryClient.invalidateQueries([
				'checks.getItem',
				locationId.toString(),
				checkId.toString(),
			]);
			queryClient.invalidateQueries(['item.getCheckInfo']);
			queryClient.invalidateQueries(['item.getAll']);
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

	const handleRightClick = (e: MouseEvent) => {
		e.preventDefault();
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
			<Show when={checkItemQuery.isSuccess && checkItemQuery.data}>
				<img
					src={'/' + checkItemQuery.data!.itemImg}
					class="w-6 h-6"
					alt={checkItemQuery.data!.itemName}
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
			})
		//{ staleTime: Infinity }
	);

	return (
		<section class="h-full bg-gray-800 text-white">
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
