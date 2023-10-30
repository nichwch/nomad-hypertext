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
  let currentlyUpdating = false;
  $: segments = contents?.split("\n") || [];
  const updateInterval = window.setInterval(async () => {
    if (
      notesDir &&
      contents !== null &&
      contents !== lastFlushedContents &&
      !currentlyUpdating
    ) {
      currentlyUpdating = true;
      const { deleted, created } = diffParagraphs(
        lastFlushedContents || "",
        contents
      );
      console.log("REINDEXING", deleted, created);
      lastFlushedContents = contents;
      /*
      We may want the following to be an atomic transaction, so it may make sense 
      to unify these two into one single method on the main process
      */
      //@ts-ignore
      await Promise.all([
        window.electronAPI.writeFile(`/${$page.params.noteName}`, contents),

        window.electronAPI.reindexFile(
          `/${$page.params.noteName}`,
          deleted,
          created
        ),
      ]);
      lastFlushedContents = contents;
      currentlyUpdating = false;
    }
  }, 500);

  onDestroy(() => {
    window.clearInterval(updateInterval);
  });
  $: if (notesDir && contents === null) {
    //@ts-ignore
    window.electronAPI.readFile(`/${$page.params.noteName}`).then(
      /** @param {string|undefined} res */
      (res) => {
        if (res) {
          contents = res;
          lastFlushedContents = res;
        }
      }
    );
  }
</script>

<div
  class="flex bg-transparent w-full flex-grow resize-none focus:outline-none overflow-y-hidden"
>
  <div class="w-full overflow-y-auto top-0 h-full">
    <div class=" w-[36rem] mx-auto h-full relative">
      <div
        class="w-full inline-block p-5 pb-10 absolute top-0 left-0 right-0 bottom-0 h-full whitespace-pre-line break-after-right"
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
        class="w-full inline-block bg-transparent p-5 pb-10 absolute top-0 left-0 right-0 bottom-0 h-full resize-none focus:outline-none whitespace-pre-line break-after-right"
        bind:innerText={contents}
      />
    </div>
  </div>
  {#if showingSidebar}<div
      class="w-2/6 flex flex-col border-l h-full border-l-black overflow-y-hidden"
    >
      <div class="border-b border-b-black p-2">
        <span>search results</span>
        <button
          class="float-right"
          on:click={() => {
            showingSidebar = !showingSidebar;
            focusedIndex = null;
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
