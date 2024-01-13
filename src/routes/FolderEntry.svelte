<script>
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import {
    promptForConfirmation,
    promptWithDialogue,
  } from "../prompt/promptStores";
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
  $: currentFilePath = decodeURIComponent($page.url.hash?.replace("#/", ""));
  const createFile = async () => {
    //@ts-ignore
    await window.electronAPI.newFile(path);
    refreshFiles();
  };

  const createDirectory = async () => {
    const folderName = await promptWithDialogue(
      "Enter name for your new folder:"
    );
    const newPath = path + "/" + folderName;
    //@ts-ignore
    await window.electronAPI.newDirectory(newPath);
    refreshFiles();
  };

  const createRenameFunction = (
    /** @type {string} */ path,
    /** @type {boolean} */ isDir
  ) => {
    return async () => {
      // const newName = await userPrompt("Label text", "Placeholder text");
      const newName = await promptWithDialogue(
        `Enter a new ${isDir ? "folder" : "file"} name:`
      );
      const slashNoteName = "/" + currentFilePath;
      if (isDir) {
        //@ts-ignore
        const newFolderPath = await window.electronAPI.renameDirectory(
          path,
          newName
        );
        refreshFiles();
        if (slashNoteName.includes(path))
          goto("note#" + slashNoteName.replace(path, newFolderPath));
      } else {
        //@ts-ignore
        const renamedPath = await window.electronAPI.renameFile(path, newName);
        refreshFiles();
        if (slashNoteName === path)
          goto("note#" + renamedPath, {
            replaceState: true,
          });
      }
    };
  };
  const createDeleteFunction = (
    /** @type {string} */ path,
    /** @type {boolean} */ isDir
  ) => {
    return async () => {
      const confirmed = await promptForConfirmation(
        `Are you sure you want to delete ${path.split("/").pop()}? ${
          isDir ? "This will delete all sub folders and files as well." : ""
        }`
      );
      if (confirmed === false) return;
      isDir
        ? //@ts-ignore
          await window.electronAPI.deleteDirectory(path)
        : //@ts-ignore
          await window.electronAPI.deleteFile(path);
      refreshFiles();
      if ("/" + currentFilePath === path) goto("", { replaceState: true });
    };
  };

  const summonCTXMenu = (
    /** @type {{ clientX: number; clientY: number; }} */ event,
    /** @type {string} */ path,
    /** @type {boolean} */ isDir
  ) => {
    $showingCTXMenu = true;
    $menuCoordinates = [event.clientX, event.clientY];

    $menuOptions = [
      ["rename", createRenameFunction(path, isDir)],
      ["delete", createDeleteFunction(path, isDir), "text-red-500"],
    ];
  };
</script>

<div style:padding-left="{layersDeep}em">
  <button
    class="text-red-800 underline hover:text-red-500"
    on:click={createFile}>[new note]</button
  >
  <button
    class="text-red-800 underline hover:text-red-500"
    on:click={createDirectory}>[new folder]</button
  >
  {#if files}
    {#each files as file}
      <div id="nav-{file.path}" role="button" tabindex={0}>
        {#if file.isDir}
          <div
            on:contextmenu={(evt) => summonCTXMenu(evt, file.path, file.isDir)}
            role="button"
            tabindex={0}
          >
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
          </div>

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
            on:contextmenu={(evt) => summonCTXMenu(evt, file.path, file.isDir)}
            role="button"
            tabindex={0}
            class:bg-crimsonHighlight={currentFilePath ===
              file.path.substring(1)}
          >
            <a href={"note#" + file.path}>
              <span> {file.name}</span>
            </a>
          </div>
        {/if}
      </div>
    {/each}
  {/if}
</div>
