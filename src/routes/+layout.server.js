import fs from "node:fs/promises";
import store from "../../store";
export const ssr = false;

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ params }) {
  /** @type {string|undefined} */
  store.set("notesDir", null);
  //@ts-ignore
  const notesDir = store.get("notesDir");
  if (notesDir) {
    //@ts-ignore
    const files = await fs.readdir(notesDir);
    return { files, notesDir };
  }
  return { notesDir };
}
