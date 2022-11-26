import { type Component, type ParentProps, onMount } from 'solid-js';
import { QueryClient, QueryClientProvider } from '@tanstack/solid-query';
import {
	BaseUserMeta,
	createClient,
	LsonObject,
	Room,
} from '@liveblocks/client';
import { z } from 'zod';

import { LocationsOnMap, type Props as LocationProps } from './Locations';
import { ItemList, selectedItemSignal } from '../components/ItemList';
import { CheckList } from './CheckList';
import { setItemData } from '../lib/state';
import { type User, UserList } from './UserList';
import type { Item } from '../lib/item-data';

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

export type Props = {
	items: Item[];
	mapWidth: number;
	users: User[];
	webRtcRoomId: string;
} & ParentProps &
	LocationProps;

export const Tracker: Component<Props> = ({
	locations,
	children,
	positionModifier,
	mapWidth,
	items,
	users,
	webRtcRoomId,
}: Props) => {
	const queryClient = new QueryClient();

	//***UNCOMMENT BELOW BLOCK FOR P2P CONNECTIONS***//
	//const webRtcClient = createClient({
	//publicApiKey: import.meta.env.PUBLIC_LIVEBLOCKS as string,
	//});
	//onMount(() => {
	//const room: Room<
	//{},
	//LsonObject,
	//BaseUserMeta,
	//{ type: 'update'; queryKey: string[] }
	//> = webRtcClient.enter(webRtcRoomId, { initialPresence: {} });
	//queryClient.setDefaultOptions({
	//mutations: {
	//onSuccess() {
	//const key = this.meta?.queryKey;
	//const parsedKey = z.array(z.string()).safeParse(key);
	//if (room && parsedKey.success) {
	//room.broadcastEvent({
	//type: 'update',
	//queryKey: parsedKey.data,
	//});
	//}
	//},
	//},
	//});
	//room.subscribe('event', ({ event: { type, queryKey } }) => {
	//switch (type) {
	//case 'update':
	//queryClient.invalidateQueries({ queryKey });
	//break;
	//}
	//});
	//});

	setItemData(items);
	return (
		<QueryClientProvider client={queryClient}>
			<main
				class="p-4 grid justify-items-center gap-8 max-w-6xl"
				onContextMenu={(e) => {
					e.preventDefault();
					setSelectedItem();
				}}>
				<div class="flex justify-between w-full flex-wrap">
					<section
						id="map"
						class="relative block bg-gray-900"
						style={{ width: `${mapWidth}px` }}>
						{children}
						<LocationsOnMap
							locations={locations}
							positionModifier={positionModifier}
						/>
					</section>
					<UserList users={users}></UserList>
				</div>
				<div class="flex justify-between w-full flex-wrap">
					<CheckList />
					<ItemList items={items} />
				</div>
			</main>
		</QueryClientProvider>
	);
};
