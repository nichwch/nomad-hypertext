<script>
  import { page } from "$app/stores";
  /** @type {string|null}*/
  let searchQuery = null;
  let searchResults = [];
  const fetchResults = async () => {
    searchResults =
      //@ts-ignore
      (await window.electronAPI.vectorQuery(searchQuery))?.hits || [];
  };
  $: if (searchQuery && searchQuery.length > 0) fetchResults();
</script>

<div>
  <div class="px-2 border-b border-b-gray-800">
    <a href="/">back</a>
  </div>
  <input
    class="w-full p-2 bg-transparent border-b border-b-gray-800 placeholder-gray-600"
    type="text"
    placeholder="search your notes..."
    bind:value={searchQuery}
  />
  <div>
    {#if searchQuery && searchQuery.length > 0}
      {#each searchResults as result}
        <div class="p-2 border-b border-b-gray-600">
          <h1 class="text-sm">
            From: <a class="underline" href={result.document.parent}
              >{result.document.parent}</a
            >
          </h1>
          <p>{result.document.content}</p>
        </div>
      {/each}
    {/if}
  </div>
</div>
