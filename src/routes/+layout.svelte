<script>
  import { onDestroy, tick } from "svelte";
  import SearchModal from "../SearchModal.svelte";
  import "../global.css";

  import { currentDir } from "./currentDirStore";
  import FolderEntry from "./FolderEntry.svelte";
  import { page } from "$app/stores";
  import { afterNavigate } from "$app/navigation";
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
  /** @typedef {{name:string, path:string, createdTime:string,isDir:boolean, modifiedTime:string, children?:FileNode[]}} FileNode */
  /** @type {FileNode[]} */
  let files = [];
  let expandedFolders = new Set();
  /** @type {boolean}*/
  let descending = true;
  $: if ($currentDir) {
    refreshFiles();
  }

  const getAllParentFolders = (/** @type string */ path) => {
    if (!notesDir) return [];
    path = "/" + path;
    path = path.replace(notesDir + "/", "");
    const currentNotePathSegmentsWithoutBase = path.split("/");
    // get rid of the file name
    currentNotePathSegmentsWithoutBase.pop();
    const allParentFolders = [];
    for (let i = 1; i < currentNotePathSegmentsWithoutBase.length + 1; i++) {
      const parentPath =
        notesDir +
        "/" +
        currentNotePathSegmentsWithoutBase.slice(0, i).join("/");
      allParentFolders.push(parentPath);
    }
    return allParentFolders;
  };

  const expandFoldersForCurrentNote = async () => {
    const parentFolders = getAllParentFolders($page.params.noteName);
    parentFolders.forEach((folder) => expandedFolders.add(folder));
    // update svelte state
    console.log({ expandedFolders });
    expandedFolders = expandedFolders;
    await tick();
    // scroll the sidebar entry into view
    const el = document.getElementById(`nav-/${$page.params.noteName}`);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  afterNavigate(() => {
    if (notesDir) expandFoldersForCurrentNote();
  });

  // recursively fetch child notes
  const fetchFilesForFolderNode = (
    /** @type FileNode */ fileNode,
    /** @type boolean */ descending
  ) => {
    // @ts-ignore
    window.electronAPI
      .readDir(fileNode.path, descending)
      .then((/** @type FileNode[] */ res) => {
        fileNode.children = res;
        // trigger svelte state update
        files = files;
        fileNode.children.forEach((/** @type FileNode */ child) => {
          if (child.isDir) fetchFilesForFolderNode(child);
        });
      });
  };
  const refreshFiles = () => {
    //@ts-ignore
    window.electronAPI.readDir($currentDir, descending).then((res) => {
      if (res) {
        files = res;
        files.forEach((/** @type FileNode */ child) => {
          if (child.isDir) fetchFilesForFolderNode(child, descending);
        });
      }
    });
  };

  //@ts-ignore
  const openInFinder = () => window.electronAPI.finderDir($currentDir);

  // some code for the modal
  let showingModal = false;
  const commandKListener = (
    /** @type {{ metaKey: any; key: string; }} */ event
  ) => {
    if (event.metaKey && event.key === "k") showingModal = !showingModal;
    else if (event.key === "Escape") showingModal = false;
  };
  window.addEventListener("keydown", commandKListener);
  onDestroy(() => window.removeEventListener("keypress", commandKListener));

  let showingSidebar = true;
  let showingFilters = false;
</script>

<div class=" bg-orange-200 h-screen flex flex-col">
  <div class="flex flex-row flex-grow h-[1px]">
    {#if showingSidebar}
      <div
        class="flex flex-col overflow-y-auto border-r border-r-black w-96 basis-96"
      >
        <div class="w-full border-b border-b-gray-800">
          <div class="px-2">
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
              <button
                class="hover:text-red-800"
                on:click={() => {
                  showingSidebar = false;
                }}>[-]</button
              >
            </div>
          </div>
        </div>
        <div class="p-2 overflow-y-auto">
          {#if notesDir}
            <FolderEntry
              {files}
              path={notesDir}
              {expandedFolders}
              setExpandedFolders={(/** @type {Set<string>} */ newFolders) =>
                (expandedFolders = newFolders)}
              {refreshFiles}
            />
          {/if}
        </div>
      </div>
    {:else}
      <div>
        <button
          class="pl-2 pt-1 hover:text-red-800"
          on:click={() => {
            showingSidebar = true;
          }}>[+]</button
        >
      </div>
    {/if}
    <slot />
  </div>

  <div class="w-full py-1 px-2 border-t border-t-gray-700">
    <button
      class="small-button"
      on:click={() => {
        showingModal = true;
      }}>search (⌘ k)</button
    >
    <button
      on:click={openInFinder}
      class="small-button text-blue-500 bg-blue-200 hover:bg-blue-300"
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
