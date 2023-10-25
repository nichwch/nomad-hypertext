<script>
  import { createEventDispatcher, onDestroy } from "svelte";

  export let showingModal = false;
  /** @type {string|null}*/
  let searchQuery = null;
  let searchResults = [];
  const dispatch = createEventDispatcher();
  const fetchResults = async () => {
    searchResults =
      //@ts-ignore
      (await window.electronAPI.vectorQuery(searchQuery))?.hits || [];
  };
  $: if (searchQuery && searchQuery.length > 0) fetchResults();

  const commandKListener = (
    /** @type {{ metaKey: any; key: string; }} */ event
  ) => {
    console.log({ event });
    if (event.metaKey && event.key === "k") showingModal = !showingModal;
    else if (event.key === "Escape") showingModal = false;
  };
  window.addEventListener("keydown", commandKListener);
  onDestroy(() => window.removeEventListener("keypress", commandKListener));
</script>

{#if showingModal}
  <button
    on:click={() => {
      dispatch("modalClose");
    }}
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
  </dialog>
{/if}
