<script>
  let notesDir = window.localStorage.getItem("notesDir");
  /** @type {string[]} */
  let files = [];
  $: if (notesDir) {
    //@ts-ignore
    window.electronAPI.readDir(notesDir).then((res) => {
      if (res) files = res;
    });
  }
  const setNoteDir = async () => {
    // call IPC to make electron show dialog
    /** @type {string|undefined}  */
    //@ts-ignore
    const res = await window.electronAPI.openDirectoryPicker();
    if (res) {
      notesDir = res;
      window.localStorage.setItem("notesDir", notesDir);
    }
  };
</script>

<div class="p-2">
  <div>
    <button on:click={setNoteDir}> open folder...</button>
    {#if notesDir !== null}
      <div>browsing {notesDir}</div>
    {/if}
  </div>
  {#each files as file}
    <div><a href={file}>{file} </a></div>
  {/each}
</div>
