<script>
  import { page } from "$app/stores";
  import { onDestroy } from "svelte";
  let notesDir = window.localStorage.getItem("notesDir");
  /** @type {string|null}*/
  let contents = null;
  /** @type {string|null}*/
  let lastFlushedContents = contents;
  const updateInterval = window.setInterval(() => {
    if (notesDir && contents !== lastFlushedContents) {
      lastFlushedContents = contents;
      //@ts-ignore
      window.electronAPI.writeFile(`/${$page.params.noteName}`, contents);
    }
  }, 100);

  let currentlyIndexing = false;
  /** @type {string|null}*/
  let lastIndexedContents = contents;
  const reindexInterval = window.setInterval(async () => {
    if (notesDir && contents !== lastIndexedContents && !currentlyIndexing) {
      lastIndexedContents = contents;
      currentlyIndexing = true;
      //@ts-ignore
      await window.electronAPI.reindexFile(`/${$page.params.noteName}`);
      currentlyIndexing = false;
    }
  }, 500);
  onDestroy(() => {
    window.clearInterval(updateInterval);
    window.clearInterval(reindexInterval);
  });
  $: if (notesDir && contents === null) {
    //@ts-ignore
    window.electronAPI.readFile(`/${$page.params.noteName}`).then(
      /** @param {string|undefined} res */
      (res) => {
        if (res) contents = res;
      }
    );
  }
</script>

<textarea
  class="max-w-md mx-auto bg-transparent w-full h-full p-5 resize-none focus:outline-none"
  bind:value={contents}
/>
