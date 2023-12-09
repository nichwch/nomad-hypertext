<script>
  import { onDestroy } from "svelte";
  import {
    menuCoordinates,
    menuOptions,
    showingCTXMenu,
  } from "./contextMenuStores";

  const clickHandler = (/** @type {{ target: any; }} */ event) => {
    let target = event.target;
    let isDescendantOfContextMenu = false;

    while (target) {
      if (target.id === "contextMenu") {
        isDescendantOfContextMenu = true;
        break;
      }
      target = target.parentNode;
    }

    if (!isDescendantOfContextMenu) $showingCTXMenu = false;
  };
  document.addEventListener("click", clickHandler);
  onDestroy(() => document.removeEventListener("click", clickHandler));
</script>

{#if $showingCTXMenu}
  {#key $menuCoordinates}
    <div
      style:left="{$menuCoordinates[0]}px"
      style:top="{$menuCoordinates[1]}px"
      id="contextMenu"
      class="absolute w-32 border border-black bg-orange-200 shadow-md"
    >
      {#each $menuOptions as menuOption}
        <button
          on:click={() => {
            menuOption[1]();
            $showingCTXMenu = false;
          }}
          class="block px-1 hover:bg-orange-300 w-full text-left {menuOption?.[2] ||
            ''}">{menuOption[0]}</button
        >
      {/each}
    </div>
  {/key}
{/if}
