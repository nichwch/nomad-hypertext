<script>
  import SearchModal from "../SearchModal.svelte";
  import "../global.css";

  let showingModal = false;
</script>

<div class=" bg-orange-200 h-full flex flex-col">
  <slot />
  <div class="w-full py-1 px-2 border-t border-t-gray-700">
    <button
      on:click={() => {
        showingModal = true;
      }}>search (command k)</button
    >
  </div>
  <SearchModal
    {showingModal}
    on:modalClose={() => {
      showingModal = false;
    }}
  />
</div>
