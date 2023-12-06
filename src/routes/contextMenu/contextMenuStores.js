import { writable } from "svelte/store";

export const showingCTXMenu = writable(false);
export const menuCoordinates = writable([300, 300]);
export const menuOptions = writable([]);
