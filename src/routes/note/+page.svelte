<script>
  import { diffParagraphs } from "$lib";
  import { afterUpdate, onDestroy, tick } from "svelte";
  import Overlay from "../../Overlay.svelte";
  import { page } from "$app/stores";
  import { afterNavigate, goto } from "$app/navigation";
  import SearchFilters from "../../SearchFilters.svelte";
  import {
    LEAST_RECENT,
    LEAST_SIMILAR,
    MOST_RECENT,
    MOST_SIMILAR,
  } from "./sortConstants";
  import Histogram from "./Histogram.svelte";
  import { splitText } from "$lib/splitFunction";
  import SearchResultDisplay from "../../SearchResultDisplay.svelte";
  import { isTextHidden } from "../../stores.js";
  /**
   * @type {string|null}
   */
  let notesDir = null;
  afterUpdate(() => {
    //@ts-ignore
    window.electronAPI.getNoteDir().then((res) => {
      notesDir = res;
    });
  });
  /** @type {string|null}*/
  let contents = null;
  /**
   * @type {any[] | null}
   */
  let searchResults = null;
  let showingSidebar = false;
  let showingFilters = false;
  let threshold = 80;
  let sortCriteria = MOST_SIMILAR;
  let excludeFromSamePage = true;
  $: currentFilePath = decodeURIComponent($page.url.hash?.replace("#/", ""));
  $: console.log({ currentFilePath });
  /** @typedef {{ score: number; document:{editTime: number} }} dbEntry*/
  let sortFunctions = {
    [MOST_SIMILAR]: (/** @type dbEntry */ b, /** @type dbEntry */ a) =>
      a.score - b.score,
    [LEAST_SIMILAR]: (/** @type dbEntry */ b, /** @type dbEntry */ a) =>
      b.score - a.score,
    [MOST_RECENT]: (/** @type dbEntry */ a, /** @type dbEntry */ b) => {
      const aEditTime = a.document.editTime ? a.document.editTime : 0;
      const bEditTime = b.document.editTime ? b.document.editTime : 0;
      return bEditTime - aEditTime;
    },
    [LEAST_RECENT]: (/** @type dbEntry */ a, /** @type dbEntry */ b) => {
      const aEditTime = a.document.editTime ? a.document.editTime : 0;
      const bEditTime = b.document.editTime ? b.document.editTime : 0;
      return aEditTime - bEditTime;
    },
  };

  const searchSegment = async (
    /** @type {string} */ segment,
    /** @type {number | null} */ index
  ) => {
    const queryResult =
      //@ts-ignore
      (await window.electronAPI.vectorQuery(segment, threshold / 100))?.hits ||
      [];
    // ignore exact matches
    // @ts-ignore
    console.log("searching with threshold...", threshold, excludeFromSamePage);
    const results = queryResult.filter(
      (
        /** @type {{ document: { content: string; parent: string; }; }} */ result
      ) => {
        if (result.document.content?.trim() === segment?.trim()) return false;
        if (
          excludeFromSamePage &&
          result.document.parent === "/" + currentFilePath
        ) {
          return false;
        }
        return true;
      }
    );
    results.sort(sortFunctions[sortCriteria]);
    searchResults = results;
    showingSidebar = true;
    focusedIndex = index;
  };
  $: console.log(searchResults);

  /** @type {number|null}*/
  let focusedIndex = null;
  /** @type {string|null}*/
  let lastFlushedContents;
  let currentlyUpdating = false;

  $: segments = splitText(contents) || [];
  const updateInterval = window.setInterval(async () => {
    /*
contents will change as this is running because the user is still typing, so 
we copy it into a separate variable
*/
    const contentsAtStart = contents;
    if (
      notesDir &&
      contentsAtStart !== null &&
      contentsAtStart !== lastFlushedContents &&
      !currentlyUpdating
    ) {
      currentlyUpdating = true;
      const { deleted, created } = diffParagraphs(
        lastFlushedContents || "",
        contentsAtStart
      );
      console.log("REINDEXING", deleted, created);
      /*
      We may want the following to be an atomic transaction, so it may make sense 
      to unify these two into one single method on the main process
      */
      //@ts-ignore
      await Promise.all([
        // @ts-ignore
        window.electronAPI.writeFile(`/${currentFilePath}`, contentsAtStart),

        // @ts-ignore
        window.electronAPI.reindexFile(`/${currentFilePath}`, deleted, created),
      ]);
      lastFlushedContents = contentsAtStart;
      currentlyUpdating = false;
    }
  }, 500);
  const scrollToAndSelectBlock = async () => {
    if (!contents) return;
    const searchedText = $page.url.searchParams?.get("search");
    if (!searchedText) return;
    const indexOfText = splitText(contents)
      // need to trim because db entries are trimmed
      .map((row) => {
        return row.trim();
      })
      ?.indexOf(searchedText);
    if (indexOfText === undefined || indexOfText === null) return;
    console.log("scrollToBlock");
    console.log(contents, indexOfText);
    /*
    In Overlay.svelte, each block has its id as `editor-block-${indexOfText}`
    We tick to wait for update to trickle down to Overlay

    NB:This function has to be in this component because we want to run it after fetching the file 
    from the electron API.   
    */
    await tick();
    const blockToScrollAndHighlight = document.getElementById(
      `editor-block-${indexOfText}`
    );
    console.log("blockToScrollscrollToBlockTo", blockToScrollAndHighlight);
    const selection = window.getSelection();
    const range = document.createRange();
    // @ts-ignore
    range.selectNodeContents(blockToScrollAndHighlight);
    selection?.removeAllRanges();
    selection?.addRange(range);
    blockToScrollAndHighlight?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  /*
  We call scrollToAndSelect after update in case we navigate to the same page and don't trigger
  a file load.

  However, calling scrollToAndSelect in afterNavigate doesn't cover the file loading case, because
  file loading takes place an indetermminate amount of time after afterNavigate triggers. This means
  the file contents may be outdated when it runs, which means the desired block might not get focused.
  */
  afterNavigate(scrollToAndSelectBlock);
  afterNavigate(() => (showingSidebar = false));

  onDestroy(() => {
    window.clearInterval(updateInterval);
  });
  $: if (notesDir && contents === null) {
    //@ts-ignore
    window.electronAPI
      .readFile(`/${currentFilePath}`)
      .then(
        /** @param {string|undefined} res */
        (res) => {
          if (res) {
            contents = res;
            lastFlushedContents = res;
            scrollToAndSelectBlock();
          }
        }
      )
      .catch(() => {
        goto("pagenotfound");
      });
  }

  const refreshResults = () => {
    if (segments && focusedIndex !== null) {
      searchSegment(segments[focusedIndex], focusedIndex);
    }
  };

  // Add this line to subscribe to the isTextHidden store
  $: hiddenClass = $isTextHidden ? "hidden-text" : "";
</script>

<div
  class="flex bg-transparent w-full flex-grow resize-none focus:outline-none overflow-y-hidden"
>
  <!-- <button on:click={() => window.electronAPI.debugPrintAll()}>print ALL</button> -->
  <div class="w-full overflow-y-auto top-0 h-full">
    <div class=" w-[36rem] mx-auto h-full relative">
      <div
        class="w-full inline-block p-5 pb-10 absolute top-0 left-0 right-0 bottom-0 h-full whitespace-pre-line break-after-right {hiddenClass}"
      >
        <Overlay {segments} {focusedIndex} {searchSegment} />
      </div>
      {#if contents === null || contents.length === 0}
        <div class="absolute top-0 p-5 italic text-gray-600">
          An empty note, but for how long?
        </div>
      {/if}
      <div
        contenteditable="plaintext-only"
        class="w-full inline-block text-transparent caret-black bg-transparent p-5 pb-10 absolute top-0 left-0 right-0 bottom-0 h-full resize-none focus:outline-none whitespace-pre-line break-after-right {hiddenClass}"
        bind:innerText={contents}
      />
    </div>
  </div>
  {#if showingSidebar}<div
      class="w-2/6 flex flex-col border-l h-full border-l-black overflow-y-hidden"
    >
      <div>
        <div class="border-b border-b-black px-2">
          <span>{searchResults?.length || 0} results</span>
          <div class="float-right">
            <button
              class="underline"
              on:click={() => {
                showingFilters = !showingFilters;
              }}
              >{#if showingFilters}
                hide filters
              {:else}
                show filters
              {/if}
            </button>
            <button
              class=" hover:text-red-800"
              on:click={() => {
                showingSidebar = !showingSidebar;
                focusedIndex = null;
              }}>[-]</button
            >
          </div>
        </div>
        <Histogram searchResults={searchResults || []} {threshold} />
        {#if showingFilters}
          <SearchFilters
            {refreshResults}
            {threshold}
            {sortCriteria}
            {excludeFromSamePage}
            setThreshold={(n) => (threshold = n)}
            setSortCriteria={(n) => (sortCriteria = n)}
            setExcludeFromSamePage={(n) => (excludeFromSamePage = n)}
          />
        {/if}
      </div>
      <div class="overflow-y-auto p-2">
        {#key searchResults}
          {#each searchResults || [] as result}
            <div class=" border-b border-b-gray-600 py-10">
              <SearchResultDisplay {result} />
            </div>
          {/each}
        {/key}
        {#if searchResults && searchResults.length === 0}
          No results found. Try relaxing your search criteria.
        {/if}
      </div>
    </div>
  {/if}
</div>
