import { createSignal } from 'solid-js';
import { getLocations } from './location-data';
import { getItemData } from './item-data';

const items = getItemData();
const locations = getLocations();

const location = locations.get('New Bark Town')!;
export const locationSignal = createSignal(location);

export const itemUnderCursorSignal = createSignal<number | undefined>();

export const itemDisplayListSignal = createSignal(
	items.map((item) => ({ ...item, selected: false }))
);
