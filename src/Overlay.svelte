<script>
  /** @type {string[]} */
  export let segments = [];

  /**
   * @type {number}
   */
  export let focusedIndex;
  /**
   * @type {(arg0: string[], arg1:number) => void}
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

{#each segments as segment, index}
  {#if segment.length > 0}
    <div
      class={focusedIndex === index
        ? "relative block bg-red-800/[0.4]"
        : "relative block"}
    >
      {segment}
      <button
        on:click={async () => {
          const results = await searchSegment(segment);
          setSearchResults(results, index);
        }}
        class="absolute opacity-50 top-0 left-full pl-3 hover:text-red-800"
        class:text-red-800={focusedIndex === index}
        class:opacity-100={focusedIndex === index}
      >
        search
      </button>
    </div>
  {:else}
    <br />
  {/if}
{/each}
