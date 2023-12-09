<script>
  import { onDestroy } from "svelte";
  import {
    displayedPrompt,
    promptConfirmation,
    prompting,
    promptInput,
    submitted,
  } from "./promptStores";

  const cancelOnEscape = (/** @type {KeyboardEvent} */ evt) => {
    if (evt.key === "Escape") $prompting = false;
  };
  document.addEventListener("keyup", cancelOnEscape);
  onDestroy(() => document.removeEventListener("keyup", cancelOnEscape));
</script>

{#if $prompting}
  <button
    on:click={() => ($prompting = false)}
    class="absolute top-0 left-0 bg-slate-500 opacity-50 w-full h-full"
  />
  <dialog
    class="absolute top-0 p-4 left-0 w-[20rem] bg-orange-200 mt-12 block border border-gray-800"
  >
    <div class="text-center">{$displayedPrompt}</div>
    {#if $prompting === "INPUT"}
      <input
        autofocus
        class="block p-2 bg-orange-300 border border-gray-800 mx-auto my-3 focus:outline-none"
        type="text"
        bind:value={$promptInput}
      />
      <button
        class="settings-button block mx-auto"
        on:click={() => ($submitted = true)}>submit</button
      >
    {:else if $prompting === "CONFIRMATION"}
      <div class="my-3 flex justify-around">
        <button
          class="settings-button"
          on:click={() => ($promptConfirmation = true)}>confirm</button
        ><button
          class="settings-button"
          tabindex="1"
          on:click={() => ($promptConfirmation = false)}>cancel</button
        >
      </div>
    {/if}
  </dialog>
{/if}
