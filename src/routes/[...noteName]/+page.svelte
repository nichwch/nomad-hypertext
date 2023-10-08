<script>
  // @ts-nocheck

  import { page } from "$app/stores";
  import { onDestroy } from "svelte";
  let notesDir = window.localStorage.getItem("notesDir");
  /** @type {string|null}*/
  let contents = null;
  /** @type {string|null}*/
  let lastFlushedContents;
  const updateInterval = window.setInterval(() => {
    if (notesDir && contents !== null && contents !== lastFlushedContents) {
      lastFlushedContents = contents;
      //@ts-ignore
      window.electronAPI.writeFile(`/${$page.params.noteName}`, contents);
    }
  }, 100);

  let currentlyIndexing = false;
  /** @type {string|null}*/
  let lastIndexedContents;
  const reindexInterval = window.setInterval(async () => {
    if (
      notesDir &&
      contents !== null &&
      contents !== lastIndexedContents &&
      !currentlyIndexing
    ) {
      console.log("REINDEXING");
      currentlyIndexing = true;
      //@ts-ignore
      await window.electronAPI.reindexFile(
        `/${$page.params.noteName}`,
        contents
      );
      lastIndexedContents = contents;
      currentlyIndexing = false;
    }
  }, 1000);
  onDestroy(() => {
    window.clearInterval(updateInterval);
    window.clearInterval(reindexInterval);
  });
  $: if (notesDir && contents === null) {
    //@ts-ignore
    window.electronAPI.readFile(`/${$page.params.noteName}`).then(
      /** @param {string|undefined} res */
      (res) => {
        if (res) {
          contents = res;
          lastIndexedContents = res;
          lastFlushedContents = res;
        }
      }
    );
  }
  $: segments = contents?.split("\n") || [];
  $: console.log({ contents, segments });
  $: console.log(JSON.stringify(contents));
</script>

<div
  class="overflow-y-auto bg-transparent w-full h-full resize-none focus:outline-none"
>
  <div class="max-w-md mx-auto relative top-0 h-full whitespace-pre-wrap">
    <div class="p-5 absolute top-0 left-0 right-0 bottom-0 w-full h-full">
      {#each segments as segment}
        {#if segment.length > 0}
          <div class="block text-green-900 opacity-50 bg-green-500">
            {segment}
          </div>
        {:else}
          <br />
        {/if}
      {/each}
    </div>
    <div
      contenteditable="plaintext-only"
      class="inline-block bg-transparent p-5 absolute top-0 left-0 right-0 bottom-0 w-full h-full resize-none focus:outline-none"
      bind:innerText={contents}
    />
  </div>
</div>
