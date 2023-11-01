<script>
  import { currentDir } from "./currentDirStore";
  /**
   * @type {string | null}
   */
  let notesDir = null;
  //@ts-ignore
  window.electronAPI.getNoteDir().then((res) => {
    if (res) {
      notesDir = res;
      $currentDir = notesDir;
    }
  });
  console.log({ notesDir, $currentDir });
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
      //@ts-ignore
      window.electronAPI.setNoteDir(notesDir);
    }
  };
  //@ts-ignore
  const openInFinder = () => window.electronAPI.finderDir($currentDir);
  const createFile = async () => {
    //@ts-ignore
    await window.electronAPI.newFile($currentDir);
    refreshFiles();
  };
</script>

<div class="flex flex-col h-full overflow-y-auto">
  <div class="w-full border-b border-b-gray-800">
    <div class="border-b border-b-gray-800 px-2">
      {#if $currentDir !== null}
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
        <button on:click={openInFinder} class="underline text-blue-500">
          [open in finder]</button
        >
      {/if}
    </div>
    <div class="px-2">
      {#if $currentDir !== null}
        <button on:click={createFile} class="underline">new note</button>
      {/if}
      <div class="float-right">
        <a href="/settings" class="underline">settings</a>
      </div>
    </div>
  </div>
  <div class="p-2 overflow-y-auto">
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
          class="block"
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
