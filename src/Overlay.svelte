<script>
  import { cTooltip } from "$lib/tooltip";
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
      return result.document.content?.trim() !== segment?.trim();
    });
  };
</script>

{#each segments as segment, index}
  {#if segment.length > 0}
    <div
      class={focusedIndex === index
        ? "relative block bg-red-800/[0.4]  whitespace-pre-wrap "
        : "relative block whitespace-pre-wrap hover:bg-orange-300"}
      class:text-green-400={segment.startsWith("//")}
    >
      {segment}
      {#if segment.startsWith("//")}
        <div class="absolute top-0 left-full pl-3 hover:text-red-800">
          <div
            class="relative"
            use:cTooltip={{
              content:
                "this paragraph is commented out and will not show up in the index",
            }}
          >
            *
          </div>
        </div>
      {:else}
        <button
          on:click={async () => {
            const results = await searchSegment(segment);
            setSearchResults(results, index);
          }}
          class="absolute top-0 left-full pl-3 hover:text-red-800"
          class:text-red-800={focusedIndex === index}
          class:opacity-100={focusedIndex === index}
        >
          <div class="relative" use:cTooltip={{ content: "show related" }}>
            #
          </div>
        </button>
      {/if}
    </div>
  {:else}
    <br />
  {/if}
{/each}
