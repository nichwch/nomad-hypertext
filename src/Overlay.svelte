<script>
  /** @type {string[]} */
  export let segments = [];
  /**
   * @type {(arg0: string[]) => void}
   */
  export let setSearchResults;
  const searchSegment = async (segment) => {
    const searchResults =
      //@ts-ignore
      (await window.electronAPI.vectorQuery(segment))?.hits || [];
    // ignore exact matches
    return searchResults.filter((result) => {
      return result.document.content !== segment;
    });
  };
</script>

{#each segments as segment}
  {#if segment.length > 0}
    <div class="relative block">
      {segment}
      <button
        on:click={async () => {
          const results = await searchSegment(segment);
          setSearchResults(results);
        }}
        class="absolute opacity-50 top-0 left-full pl-3 hover:text-red-800"
      >
        search
      </button>
    </div>
  {:else}
    <br />
  {/if}
{/each}
