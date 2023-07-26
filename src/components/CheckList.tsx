import { createSignal, For, Match, Show, Switch } from 'solid-js';
import { currentLocationSignal } from './Locations';
import { selectedItemSignal } from './ItemList';
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
		() => client.checks.getItems.query({ checkId, locationId })
	);

	const checkMarkerQuery = createQuery(
		() => ['checks.getMarkers', locationId.toString(), checkId.toString()],
		() => client.checks.getMarkers.query({ checkId, locationId })
	)

	const checkItemAddMutation = createMutation({
		mutationFn: ({ itemId }: { itemId: number, itemName: string, itemImg: string }) =>
			client.item.setCheck.mutate({
				checkId,
				checkLocationId: locationId,
				itemId,
			}),
		meta: { queryKey: ['checks'] },
		onMutate({ itemId, itemName, itemImg }) {
			const currentItemData = checkItemQuery.data ?? [];
			if (currentItemData.some((item) => item.id === itemId)) return
			queryClient.setQueryData(
				['checks.getItem', locationId.toString(), checkId.toString()],
				[...currentItemData, { id: itemId, name: itemName, img: itemImg }]
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

	const checkItemDeleteMutation = createMutation({
		mutationFn: ({ itemId }: { itemId: number }) =>
			client.item.removeCheck.mutate({
				itemId,
			}),
		meta: { queryKey: ['checks'] },
		onMutate({ itemId }) {
			const currentItemData = checkItemQuery.data ?? [];
			const newItemData = currentItemData.filter((item) => item.id !== itemId);
			queryClient.setQueryData(
				['checks.getItem', locationId.toString(), checkId.toString()],
				newItemData
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

	const checkMarkerAddMutation = createMutation({
		mutationFn: ({ markerId }: { markerId: number, markerImg: string, markerName: string }) =>
			client.checks.addMarker.mutate({
				checkId,
				locationId,
				markerId,
			}),
		meta: { queryKey: ['checks'] },
		onMutate({ markerId, markerImg, markerName }) {
			const currentMarkerData = checkMarkerQuery.data ?? [];
			if (currentMarkerData.some((marker) => marker.id === markerId)) return
			queryClient.setQueryData(
				['checks.getMarkers', locationId.toString(), checkId.toString()],
				[...currentMarkerData, { id: markerId, name: markerName, img: markerImg }]
			);
		},
		onSettled: () => {
			queryClient.invalidateQueries([
				'checks.getMarkers',
				locationId.toString(),
				checkId.toString(),
			]);
		}
	})

	const checkMarkerDeleteMutation = createMutation({
		mutationFn: ({ markerId }: { markerId: number }) =>
			client.checks.removeMarker.mutate({
				checkId,
				locationId,
				markerId,
			}),
		meta: { queryKey: ['checks'] },
		onMutate({ markerId }) {
			const currentMarkerData = checkMarkerQuery.data ?? [];
			const newMarkerData = currentMarkerData.filter((marker) => marker.id !== markerId);
			queryClient.setQueryData(
				['checks.getMarkers', locationId.toString(), checkId.toString()],
				newMarkerData
			);
		},
		onSettled: () => {
			queryClient.invalidateQueries([
				'checks.getMarkers',
				locationId.toString(),
				checkId.toString(),
			]);
		}
	})

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
			if (selectedItem()!.type === "MARKER") checkMarkerAddMutation.mutate({ markerId: selectedItem()!.id, markerImg: selectedItem()!.src, markerName: selectedItem()!.name })
			else checkItemAddMutation.mutate({ itemId: selectedItem()!.id, itemName: selectedItem()!.name, itemImg: selectedItem()!.src })
			setSelectedItem(undefined);
		}
	};

	const handleRightClick = (e: MouseEvent) => {
		e.preventDefault();
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
			<Show when={checkItemQuery.isSuccess && checkItemQuery.data}>
				<For each={checkItemQuery.data!}>
					{(item) => (
						<img
							src={'/' + item.img}
							class="w-6 h-6"
							alt={item.name}
							onContextMenu={(e) => {
								e.preventDefault()
								checkItemDeleteMutation.mutate({ itemId: item.id })
							}}
						/>
					)}
				</For>
			</Show>

			<Show when={checkMarkerQuery.isSuccess && checkMarkerQuery.data}>
				<For each={checkMarkerQuery.data!}>
					{(marker) => (
						<img
							src={'/' + marker.img}
							class="w-6 h-6"
							alt={marker.name}
							onContextMenu={(e) => {
								e.preventDefault()
								checkMarkerDeleteMutation.mutate({ markerId: marker.id })
							}}
						/>
					)}
				</For>
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
