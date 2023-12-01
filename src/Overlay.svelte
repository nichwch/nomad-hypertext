<script>
  import { afterNavigate } from "$app/navigation";
  import { page } from "$app/stores";
  import { cTooltip } from "$lib/tooltip";
  import { onDestroy, tick } from "svelte";
  /** @type {string[]} */
  export let segments = [];

  /**
   * @type {number|null}
   */
  export let focusedIndex;
  /**
   * @type {(arg0: string[], arg1:number) => void}
   */
  export let setSearchResults;
  // @ts-ignore
  const searchSegment = async (segment) => {
    const searchResults =
      //@ts-ignore
      (await window.electronAPI.vectorQuery(segment))?.hits || [];
    // ignore exact matches
    // @ts-ignore
    return searchResults.filter((result) => {
      return result.document.content?.trim() !== segment?.trim();
    });
  };
</script>

{#each segments as segment, index}
  {#if segment.length > 0}
    <div
      class={focusedIndex === index || segment.startsWith("//")
        ? "relative block  whitespace-pre-wrap "
        : "relative block whitespace-pre-wrap hover:text-red-800"}
      class:text-red-800={focusedIndex === index}
      class:text-green-800={segment.startsWith("//")}
      role="presentation"
    >
      <span id="editor-block-{index}">{segment}</span>

      {#if !segment.startsWith("//") && segment?.trim()?.length > 0}
        <button
          on:click={async () => {
            const results = await searchSegment(segment);
            setSearchResults(results, index);
          }}
          class="absolute top-0 left-full pl-3 hover:text-red-800"
          class:text-red-800={focusedIndex === index}
          class:opacity-100={focusedIndex === index}
        >
          <div class="relative p-2" use:cTooltip={{ content: "show related" }}>
            #
          </div>
        </button>
      {/if}
    </div>
  {:else}
    <br />
  {/if}
{/each}
