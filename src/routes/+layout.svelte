<script>
  import { onDestroy } from "svelte";
  import SearchModal from "../SearchModal.svelte";
  import "../global.css";

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
  //@ts-ignore
  const openInFinder = () => window.electronAPI.finderDir($currentDir);
  const createFile = async () => {
    //@ts-ignore
    await window.electronAPI.newFile($currentDir);
    refreshFiles();
  };
  let showingModal = false;
  const commandKListener = (
    /** @type {{ metaKey: any; key: string; }} */ event
  ) => {
    if (event.metaKey && event.key === "k") showingModal = !showingModal;
    else if (event.key === "Escape") showingModal = false;
  };
  window.addEventListener("keydown", commandKListener);
  onDestroy(() => window.removeEventListener("keypress", commandKListener));
</script>

<div class=" bg-orange-200 h-screen flex flex-col">
  <div class="flex flex-row flex-grow h-[1px]">
    <div
      class="flex flex-col overflow-y-auto border-r border-r-black w-96 basis-96"
    >
      <div class="w-full border-b border-b-gray-800">
        <div class="px-2">
          {#if $currentDir !== null}
            <button on:click={createFile} class="underline">new note</button>
          {/if}
          <button
            class:underline={descending}
            on:click={() => {
              descending = true;
              refreshFiles();
            }}
          >
            new first</button
          >

          <button
            class:underline={!descending}
            on:click={() => {
              descending = false;
              refreshFiles();
            }}
          >
            old first</button
          >
          <div class="float-right">
            <a href="/settings" class="underline">settings</a>
          </div>
        </div>
      </div>
      <div class="p-2 overflow-y-auto">
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
                <span> {file.name}</span>
                <!-- <span class="float-right text-gray-700"
                  >created {new Date(file.createdTime).toLocaleString()}</span
                > -->
              </a>
            </div>
          {/if}
        {/each}
      </div>
    </div>
    <slot />
  </div>

  <div class="w-full py-1 px-2 border-t border-t-gray-700">
    <button
      class="settings-button"
      on:click={() => {
        showingModal = true;
      }}>search (⌘ k)</button
    >
    <button
      on:click={openInFinder}
      class="settings-button text-blue-500 bg-blue-200 hover:bg-blue-300"
    >
      open in finder</button
    >
  </div>
</div>
<SearchModal
  {showingModal}
  on:modalClose={() => {
    showingModal = false;
  }}
/>
