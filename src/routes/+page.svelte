<script>
  let notesDir = window.localStorage.getItem("notesDir");
  /** @type {{name:string, path:string, createdTime:string, modifiedTime:string}[]} */
  let files = [];
  /** @type {boolean}*/
  let descending = true;
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
        <div class="float-right">
          {#if notesDir !== null}
            <button on:click={createFile}>new note</button>
          {/if}
          <a href="/search">search</a>
          <button
            on:click={() => {
              //@ts-ignore
              window.electronAPI.indexDirectory(notesDir);
            }}
            >index directory
          </button>
          <button
            on:click={() => {
              //@ts-ignore
              window.electronAPI.clearDB();
            }}
            >clear DB<button />
          </button>
        </div>
      </div>
    {/if}
  </div>
  <div class="p-2">
    <div>
      <button
        class:underline={descending}
        on:click={() => {
          descending = true;
          refreshFiles();
        }}
      >
        newest first</button
      >

      <button
        class:underline={!descending}
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
        <a href={file.path}>
          <span> {file.name}</span><span class="float-right text-gray-700"
            >created {new Date(file.createdTime).toLocaleString()}</span
          >
        </a>
      </div>
    {/each}
  </div>
</div>
