<script>
  import { afterUpdate } from "svelte";
  import { currentDir } from "../currentDirStore";

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
      window.electronAPI.setNoteDir(notesDir);
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

      <button class="mt-2 settings-button" on:click={setNoteDir}
        >change notes folder</button
      >
    </div>
  </div>
</div>
