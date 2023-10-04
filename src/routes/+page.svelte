<script>
  import { currentDir } from "./currentDirStore";

  let notesDir = window.localStorage.getItem("notesDir");
  if ($currentDir === null && notesDir !== null) $currentDir = notesDir;
  /** @type {{name:string, path:string, createdTime:string,isDir:boolean, modifiedTime:string}[]} */
  let files = [];
  /** @type {boolean}*/
  let descending = true;
  $: notesDirSections =
    $currentDir
      ?.replace(notesDir || "", "")
      .trim()
      ?.split("/")
      .slice(1) || [];
  $: if ($currentDir) {
    refreshFiles();
  }
  const refreshFiles = () => {
    //@ts-ignore
    window.electronAPI.readDir($currentDir, descending).then((res) => {
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
      $currentDir = notesDir;
      window.localStorage.setItem("notesDir", notesDir);
    }
  };
  const createFile = async () => {
    //@ts-ignore
    await window.electronAPI.newFile($currentDir);
    refreshFiles();
  };
</script>

<div class="flex flex-col">
  <div class="w-full border-b border-b-gray-800">
    {#if $currentDir !== null}
      <div class="border-b border-b-gray-800 px-2">
        browsing
        <button
          class="hover:underline"
          on:click={() => (($currentDir = notesDir), refreshFiles())}
          >{notesDir}/</button
        >
        {#each notesDirSections as notesDirSection, index}
          <button
            class="hover:underline"
            class:text-red-800={index === notesDirSections.length - 1}
            on:click={() => {
              notesDirSections = notesDirSections.slice(0, index + 1);
              $currentDir = notesDir + "/" + notesDirSections.join("/");
              refreshFiles();
            }}>{notesDirSection}/</button
          >
        {/each}
      </div>
      <div class="px-2">
        <button on:click={setNoteDir}> open folder...</button>
        <div class="float-right">
          {#if $currentDir !== null}
            <button on:click={createFile}>new note</button>
          {/if}
          <a href="/search">search</a>
          <button
            on:click={() => {
              //@ts-ignore
              window.electronAPI.indexDirectory($currentDir);
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
      {#if file.isDir}
        <button
          on:click={() => {
            $currentDir = file.path;
            refreshFiles();
          }}
        >
          {file.name}
        </button>
      {:else}
        <div>
          <a href={file.path}>
            <span> {file.name}</span><span class="float-right text-gray-700"
              >created {new Date(file.createdTime).toLocaleString()}</span
            >
          </a>
        </div>
      {/if}
    {/each}
  </div>
</div>
