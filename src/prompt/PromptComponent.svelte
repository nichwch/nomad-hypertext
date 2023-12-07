<script>
  import { prompting, promptInput, submitted } from "./promptStores";
</script>

{#if $prompting}
  <button
    on:click={() => ($prompting = false)}
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
      bind:value={$promptInput}
    />
    <button on:click={() => ($submitted = true)}>submit</button>
  </dialog>
{/if}
