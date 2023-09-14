<script>
  import { invalidateAll } from "$app/navigation";
  export let data;
  const { files, notesDir } = data;

  const setNoteDir = async () => {
    // call IPC to make electron show dialog
    /** @type {string|undefined}  */
    //@ts-ignore
    const res = await window.electronAPI.openDirectoryPicker();
    if (res) {
      console.log("fileres", res);
      //@ts-ignore
      await window.electronAPI.setStoreValue("notesDir", res);
      invalidateAll();
    }
  };
</script>

<div class="p-2">
  <div>
    {#if notesDir !== null}
      <div>browsing {notesDir}</div>
    {/if}

    <button on:click={setNoteDir}> open folder...</button>
  </div>
  {#if files}
    {#each files as file}
      <div><a href="/{file}">{file}</a></div>
    {/each}
  {/if}
</div>
