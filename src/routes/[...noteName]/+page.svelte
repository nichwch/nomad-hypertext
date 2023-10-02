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
  }, 300);
  onDestroy(() => window.clearInterval(updateInterval));
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
