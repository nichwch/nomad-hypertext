<script>
  import { createEventDispatcher } from "svelte";
  import SearchResultDisplay from "./SearchResultDisplay.svelte";

  export let showingModal = false;
  /** @type {string|null}*/
  let searchQuery = null;

  /** @type {any[]} */
  let searchResults = [];
  const dispatch = createEventDispatcher();
  const fetchResults = async () => {
    searchResults =
      //@ts-ignore
      (await window.electronAPI.vectorQuery(searchQuery))?.hits || [];
  };
  $: if (searchQuery && searchQuery.length > 0) fetchResults();
</script>

{#if showingModal}
  <button
    on:click={() => dispatch("modalClose")}
    class="absolute top-0 left-0 bg-slate-500 opacity-50 w-full h-full"
  />
  <dialog
    class="absolute top-0 left-0 w-[36rem] h-4/6 bg-orange-200 mt-12 flex flex-col border border-gray-800"
  >
    <input
      autofocus
      class="w-full p-2 bg-transparent border-b border-b-gray-800 placeholder-gray-600"
      type="text"
      placeholder="search your notes..."
      bind:value={searchQuery}
    />
    <div class="overflow-y-auto">
      {#if searchQuery && searchQuery.length > 0}
        {#each searchResults as result}
          <div class="p-2 border-b border-b-gray-600">
            <SearchResultDisplay {result} />
          </div>
        {/each}
      {/if}
    </div>
  </dialog>
{/if}
