<script>
  import { GROUP_DELIM } from "$lib/splitFunction";
  import { cTooltip } from "$lib/tooltip";
  import { isTextHidden } from "./stores.js";
  /** @type {string[]} */
  export let segments = [];

  /**
   * @type {number|null}
   */
  export let focusedIndex;
  /**
   * @type {(arg0: string, arg1:number) => void}
   */
  export let searchSegment;
</script>

{#each segments as segment, index}
  {#if segment.length > 0}
    <div
      class={focusedIndex === index || segment.startsWith("//")
        ? "relative block  whitespace-pre-wrap  "
        : "relative block whitespace-pre-wrap hover:text-red-800"}
      class:text-red-800={focusedIndex === index}
      class:text-green-800={segment.startsWith("//")}
      role="presentation"
    >
      <span
        id="editor-block-{index}"
        class={$isTextHidden
          ? "bg-crimsonHighlightOpaque text-crimsonHighlightOpaque"
          : ""}>{segment}</span
      >

      {#if !segment.startsWith("//") && segment?.trim()?.length > 0 && segment?.trim() !== GROUP_DELIM}
        <button
          on:click={async () => {
            searchSegment(segment, index);
          }}
          class="absolute top-0 left-full pl-3 hover:text-red-800"
          class:text-red-800={focusedIndex === index}
          class:opacity-100={focusedIndex === index}
        >
          <div
            class="relative p-2"
            use:cTooltip={{ content: "show related", placement: "right" }}
          >
            #
          </div>
        </button>
      {/if}
    </div>
  {:else}
    <br />
  {/if}
{/each}
