<script>
  import { afterUpdate } from "svelte";
  import { currentDir } from "../currentDirStore";
  import { goto } from "$app/navigation";

  /** @type {import('./$types').PageData} */
  export let data;
  /**
   * @type {string | null}
   */
  let notesDir = null;

  afterUpdate(() => {
    //@ts-ignore
    window.electronAPI.getNoteDir().then((res) => {
      notesDir = res;
    });
  });
  const setNoteDir = async () => {
    // call IPC to make electron show dialog
    /** @type {string|undefined}  */
    //@ts-ignore
    const res = await window.electronAPI.openDirectoryPicker();
    if (res) {
      notesDir = res;
      $currentDir = notesDir;
      //@ts-ignore
      await window.electronAPI.setNoteDir(notesDir);
      goto("/");
    }
  };
</script>

<div class="flex-grow flex flex-col overflow-y-auto">
  <div class="overflow-y-auto">
    <div class="w-[36rem] mx-auto py-10">
      <h1 class="text-2xl mb-2">Get started</h1>

      <p>
        Welcome to Nomad Hypertext! To get started, pick a folder to store your
        notes in.
      </p>
      <p class="mt-3">
        If you want to pick a folder with existing notes, you will have to index
        them aftewards (only text and markdown files are supported). You can do
        this by going to settings and clicking 'reindex notes' after picking
        your notes folder.
      </p>

      <button class="mt-3 settings-button" on:click={setNoteDir}
        >select notes folder</button
      >
    </div>
  </div>
</div>
