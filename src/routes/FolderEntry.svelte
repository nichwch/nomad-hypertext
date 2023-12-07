<script>
  import { page } from "$app/stores";
  import { promptWithDialogue } from "../prompt/promptStores";
  import {
    menuCoordinates,
    menuOptions,
    showingCTXMenu,
  } from "./contextMenu/contextMenuStores";

  /** @typedef {{name:string, path:string, createdTime:string,isDir:boolean, modifiedTime:string, children?:FileNode[]}} FileNode */
  /** @type {FileNode[]} */
  export let files;
  /** @type {string}*/
  export let path;
  /** @type Set<string> */
  export let expandedFolders;
  /**  @type {(str: Set<string>) => void} */
  export let setExpandedFolders;
  export let layersDeep = 0;
  /**
   * @type {() => void}
   */
  export let refreshFiles;
  const createFile = async () => {
    //@ts-ignore
    await window.electronAPI.newFile(path);
    refreshFiles();
  };
  const createRenameFunction = (path) => {
    return async () => {
      // const newName = await userPrompt("Label text", "Placeholder text");
      const newName = await promptWithDialogue("Enter a new file name:");
      console.log("renaming", path, newName);
      //@ts-ignore
      return window.electronAPI.renameFile(path, newName);
    };
  };
  const createDeleteFunction = (/** @type {string} */ path) => {
    return () => {
      console.log("deleteing", path);
      //@ts-ignore
      return window.electronAPI.deleteFile(path);
    };
  };

  const summonCTXMenu = (
    /** @type {{ clientX: number; clientY: number; }} */ event,
    /** @type {string} */ path
  ) => {
    $showingCTXMenu = true;
    $menuCoordinates = [event.clientX, event.clientY];
    $menuOptions = [
      ["rename", createRenameFunction(path)],
      ["delete", createDeleteFunction(path), "text-red-500"],
    ];
  };
</script>

<div style:padding-left="{layersDeep}em">
  <button
    class="text-red-800 underline hover:text-red-500"
    on:click={createFile}>[new note]</button
  >
  {#if files}
    {#each files as file}
      <div
        id="nav-{file.path}"
        on:contextmenu={(evt) => summonCTXMenu(evt, file.path)}
        role="button"
        tabindex={0}
      >
        {#if file.isDir}
          <button
            class="block"
            class:font-bold={expandedFolders.has(file.path)}
            on:click={() => {
              if (expandedFolders.has(file.path))
                expandedFolders.delete(file.path);
              else expandedFolders.add(file.path);
              // trigger svelte update
              setExpandedFolders(expandedFolders);
            }}
          >
            {expandedFolders.has(file.path) ? "v" : ">"}
            {file.name}
          </button>
          {#if expandedFolders.has(file.path)}
            <svelte:self
              files={file.children}
              path={file.path}
              {expandedFolders}
              layersDeep={layersDeep + 1}
              {refreshFiles}
              {setExpandedFolders}
            />
          {/if}
        {:else}
          <div
            class:bg-crimsonHighlight={$page.params.noteName ===
              file.path.substring(1)}
          >
            <a href={file.path}>
              <span> {file.name}</span>
            </a>
          </div>
        {/if}
      </div>
    {/each}
  {/if}
</div>
