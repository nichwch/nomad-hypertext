<script>
  let notesDir = window.localStorage.getItem("notesDir");
  /** @type {string[]} */
  let files = [];
  $: if (notesDir) {
    refreshFiles();
  }
  const refreshFiles = () => {
    //@ts-ignore
    window.electronAPI.readDir(notesDir).then((res) => {
      if (res) files = res;
    });
  };
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
  const createFile = async () => {
    const todaysDate = new Date().toDateString();
    //@ts-ignore
    await window.electronAPI.newFile(notesDir);
    refreshFiles();
  };
</script>

<div class="p-2">
  <div>
    <button on:click={setNoteDir}> open folder...</button>
    {#if notesDir !== null}
      <div>browsing {notesDir}</div>

      <button
        on:click={() => {
          //@ts-ignore
          window.electronAPI.indexDirectory(notesDir);
        }}
        >index directory
      </button>
      <button
        on:click={async () => {
          //@ts-ignore
          const results = await window.electronAPI.vectorQuery("Hello world");
          console.log(results);
        }}
        >query directory
      </button>
    {/if}
  </div>
  {#if notesDir !== null}
    <button on:click={createFile}>new note</button>
  {/if}
  {#each files as file}
    <div><a href={file}>{file} </a></div>
  {/each}
</div>
