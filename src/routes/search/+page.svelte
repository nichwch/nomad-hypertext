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
  <a href="/">back</a>
  <input type="text" bind:value={searchQuery} />
  {#if searchQuery && searchQuery.length > 0}
    {#each searchResults as result}
      <div>
        <h1>
          From: <a href={`/${result.document.parent}`}
            >{result.document.parent}</a
          >
        </h1>
        <p>{result.document.content}</p>
      </div>
    {/each}
  {/if}
</div>
