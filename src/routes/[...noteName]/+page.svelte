<script>
  // @ts-nocheck
  import { page } from "$app/stores";
  import { diffParagraphs } from "$lib";
  import { onDestroy } from "svelte";
  import Overlay from "../../Overlay.svelte";
  let notesDir = window.localStorage.getItem("notesDir");
  /** @type {string|null}*/
  let contents = null;
  let searchResults = null;
  let showingSidebar = false;
  /** @type {number|null}*/
  let focusedIndex = null;
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
  $: segments = contents?.split("\n") || [];
  const reindexInterval = window.setInterval(async () => {
    if (
      notesDir &&
      contents !== null &&
      contents !== lastIndexedContents &&
      !currentlyIndexing
    ) {
      const { deleted, created } = diffParagraphs(
        lastIndexedContents,
        contents
      );
      console.log("REINDEXING", deleted, created);
      currentlyIndexing = true;
      //@ts-ignore
      await window.electronAPI.reindexFile(
        `/${$page.params.noteName}`,
        deleted,
        created
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
</script>

<div class="flex bg-transparent w-full h-full resize-none focus:outline-none">
  <div class="w-full overflow-y-auto top-0 h-full whitespace-pre-wrap">
    <div class="w-5/12 mx-auto h-full relative">
      <div
        class="w-full inline-block p-5 absolute top-0 left-0 right-0 bottom-0 h-full"
      >
        <Overlay
          {segments}
          {focusedIndex}
          setSearchResults={(results, index) => {
            showingSidebar = true;
            searchResults = results;
            focusedIndex = index;
          }}
        />
      </div>
      <div
        contenteditable="plaintext-only"
        class="w-full inline-block bg-transparent p-5 absolute top-0 left-0 right-0 bottom-0 h-full resize-none focus:outline-none"
        bind:innerText={contents}
      />
    </div>
  </div>
  {#if showingSidebar}<div
      class="w-2/6 flex flex-col border-l border-l-black h-full"
    >
      <div class="border-b border-b-black p-2">
        <span>search results</span>
        <button
          class="float-right"
          on:click={() => {
            showingSidebar = !showingSidebar;
          }}>hide</button
        >
      </div>
      <div class="overflow-y-auto p-2">
        {#each searchResults as result}
          <div class=" border-b border-b-gray-600">
            <h1 class="text-sm">
              From: <a class="underline" href={result.document.parent}
                >{result.document.parent}</a
              >
            </h1>
            <p>{result.document.content}</p>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>
