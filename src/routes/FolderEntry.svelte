<script>
  import { page } from "$app/stores";

  /** @typedef {{name:string, path:string, createdTime:string,isDir:boolean, modifiedTime:string, children?:FileNode[]}} FileNode */
  /** @type {FileNode[]} */
  export let files;
  /** @type Set<string> */
  export let expandedFolders;
  /**  @type {(str: Set<string>) => void} */
  export let setExpandedFolders;
  export let layersDeep = 0;
</script>

<div style:padding-left="{layersDeep}em">
  {#each files as file}
    <!-- {@const isOpen = expandedFolders.has(file.path)} -->
    {#if file.isDir}
      <button
        class="block"
        class:font-bold={expandedFolders.has(file.path)}
        on:click={() => {
          if (expandedFolders.has(file.path)) expandedFolders.delete(file.path);
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
          {expandedFolders}
          layersDeep={layersDeep + 1}
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
  {/each}
</div>
