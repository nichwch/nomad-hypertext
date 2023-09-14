import fs from "node:fs/promises";
export const ssr = false;

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ params }) {
  /** @type {string|undefined} */
  //@ts-ignore
  const notesDir = "/Users/nichwch/notes";
  console.log({ notesDir });
  if (notesDir) {
    const files = await fs.readdir(notesDir);
    console.log("sveltekit files", files);
    return { files, notesDir };
  }
  return { notesDir };
}
