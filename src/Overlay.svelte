<script>
  /** @type {string[]} */
  export let segments = [];
  const searchSegment = async (/** @type {string} */ segment) => {
    const searchResults =
      //@ts-ignore
      (await window.electronAPI.vectorQuery(searchQuery))?.hits || [];
    console.log(searchResults);
  };
</script>

{#each segments as segment}
  {#if segment.length > 0}
    <div class="relative block">
      {segment}
      <button
        on:click={() => {
          searchSegment(segment);
        }}
        class="absolute opacity-50 top-0 left-full pl-3 hover:text-red-800"
      >
        test
      </button>
    </div>
  {:else}
    <br />
  {/if}
{/each}
