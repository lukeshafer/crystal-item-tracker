import { createSignal } from 'solid-js';
//import { createStore } from 'solid-js/store';

import { getLocations } from './location-data';
import { getItemData } from './item-data';

const items = getItemData();
const locations = getLocations();

const location = locations.get('New Bark Town')!;
export const locationSignal = createSignal(location);

//const createLocationStore = (locations: Location[]) => {
//const locationStore = createStore(locations);
//};

export const itemUnderCursorSignal = createSignal<number | undefined>();

export const itemDisplayListSignal = createSignal(
	items.map((item) => ({ ...item, selected: false }))
);
