<script>
  let notesDir = window.localStorage.getItem("notesDir");
  /** @type {{name:string, createdTime:string, modifiedTime:string}[]} */
  let files = [];
  /** @type {boolean}*/
  let descending = false;
  $: if (notesDir) {
    refreshFiles();
  }
  const refreshFiles = () => {
    //@ts-ignore
    window.electronAPI.readDir(notesDir, descending).then((res) => {
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
    //@ts-ignore
    await window.electronAPI.newFile(notesDir);
    refreshFiles();
  };
</script>

<div class="flex flex-col">
  <div class="w-full border-b border-b-gray-800">
    {#if notesDir !== null}
      <div class="border-b border-b-gray-800 px-2">browsing {notesDir}</div>
      <div class="px-2">
        <button on:click={setNoteDir}> open folder...</button>
        {#if notesDir !== null}
          <button on:click={createFile}>new note</button>
        {/if}
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
            const results = await window.electronAPI.vectorQuery("vector");
            console.log(results);
          }}
          >query directory
          <button
            on:click={() => {
              //@ts-ignore
              window.electronAPI.clearDB();
            }}>clear DB<button /></button
          >
        </button>
      </div>
    {/if}
  </div>
  <div class="p-2">
    <div>
      <button
        class:underline={!descending}
        on:click={() => {
          descending = true;
          refreshFiles();
        }}
      >
        newest first</button
      >

      <button
        class:underline={descending}
        on:click={() => {
          descending = false;
          refreshFiles();
        }}
      >
        oldest first</button
      >
    </div>
    {#each files as file}
      <div>
        <a href={file.name}>{file.name}, created {file.createdTime} </a>
      </div>
    {/each}
  </div>
</div>
