<script>
  import { page } from "$app/stores";

  /** @typedef {{name:string, path:string, createdTime:string,isDir:boolean, modifiedTime:string, children?:FileNode[]}} FileNode */
  /** @type {FileNode[]} */
  export let files;
  /** @type Set<string> */
  export let expandedFolders;
  export let layersDeep = 0;
  $: console.log($page.params.noteName, files);
</script>

<div style:padding-left="{layersDeep}em">
  {#each files as file}
    {@const isOpen =
      expandedFolders.has(file.path) ||
      $page.params.noteName.includes(file.path.substring(1))}
    {#if file.isDir}
      <button
        class="block"
        class:font-bold={isOpen}
        on:click={() => {
          console.log(file.path, expandedFolders);
          if (expandedFolders.has(file.path)) expandedFolders.delete(file.path);
          else expandedFolders.add(file.path);
          // trigger svelte update
          expandedFolders = expandedFolders;
        }}
      >
        {isOpen ? "v" : ">"}
        {file.name}
      </button>
      {#if isOpen}
        <svelte:self
          files={file.children}
          {expandedFolders}
          layersDeep={layersDeep + 1}
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
