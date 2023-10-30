<script>
  import { onDestroy } from "svelte";
  import SearchModal from "../SearchModal.svelte";
  import "../global.css";

  let showingModal = false;
  const commandKListener = (
    /** @type {{ metaKey: any; key: string; }} */ event
  ) => {
    if (event.metaKey && event.key === "k") showingModal = !showingModal;
    else if (event.key === "Escape") showingModal = false;
  };
  window.addEventListener("keydown", commandKListener);
  onDestroy(() => window.removeEventListener("keypress", commandKListener));
</script>

<div class=" bg-orange-200 h-screen flex flex-col">
  <slot />
  <div class="w-full py-1 px-2 border-t border-t-gray-700">
    <button
      class="settings-button"
      on:click={() => {
        showingModal = true;
      }}>search (⌘ k)</button
    >
  </div>
</div>
<SearchModal
  {showingModal}
  on:modalClose={() => {
    showingModal = false;
  }}
/>
