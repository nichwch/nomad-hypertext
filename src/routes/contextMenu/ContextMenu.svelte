<script>
  import { onDestroy } from "svelte";
  import { menuCoordinates, showingCTXMenu } from "./contextMenuStores";

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
  $: console.log("coords", $menuCoordinates);
</script>

{#if $showingCTXMenu}
  {#key $menuCoordinates}
    <div
      style:left={$menuCoordinates[0]}
      style:top={$menuCoordinates[1]}
      id="contextMenu"
      class="absolute w-32 h-52 border border-black bg-red-900"
    />
  {/key}
{/if}
