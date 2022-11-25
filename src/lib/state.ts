import { createSignal } from 'solid-js';
//import { createStore } from 'solid-js/store';

import type { Item } from './item-data';

export const itemUnderCursorSignal = createSignal<number | undefined>();

//export const itemListStore = createStore<Item[]>([]);

let itemData: Item[] = [];

export const setItemData = (items: any[]) => (itemData = items);
export const getItemData = () => itemData;
