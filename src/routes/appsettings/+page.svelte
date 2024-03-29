<script>
  import { afterUpdate, onMount } from "svelte";
  import { currentDir } from "../currentDirStore";
  /**
   * @type {string | null}
   */
  let notesDir = null;
  /**
   * @type {string | null}
   */
  let appDataDir = null;
  onMount(() => {
    //@ts-ignore
    window.electronAPI.getAppDir().then((res) => {
      appDataDir = res;
    });
  });

  afterUpdate(() => {
    //@ts-ignore
    window.electronAPI.getNoteDir().then((res) => {
      notesDir = res;
    });
  });
  let showingModal = false;
  const setNoteDir = async () => {
    // call IPC to make electron show dialog
    /** @type {string|undefined}  */
    //@ts-ignore
    const res = await window.electronAPI.openDirectoryPicker();
    if (res) {
      notesDir = res;
      $currentDir = notesDir;
      //@ts-ignore
      window.electronAPI.setNoteDir(notesDir);
    }
  };
  //@ts-ignore
  const openInFinder = (dir) => window.electronAPI.finderDir(dir);
</script>

<div class="flex-grow flex flex-col overflow-y-auto">
  <div class="overflow-y-auto">
    <div class="w-[36rem] mx-auto py-10">
      <div>
        <h1 class="text-2xl">Notes folder</h1>
        <p class="mt-2">
          Your notes folder are where all your notes are created and stored. It
          is also where the semantic search index will be created. Notes inside
          of your notes folder can be searched, notes outside cannot.
        </p>
        <p class="mt-2">
          The index file is located at the root of your notes folder in a file
          called <button
            on:click={() => openInFinder(`${$currentDir}/.dbfile.msp`)}
            class="link"
          >
            .dbfile.msp.
          </button> You can read this file from other apps using OramaDB, but be
          careful to not let the index go out of sync with your notes. If this happens,
          you can use the following options to delete the index and recreate it from
          scratch.
        </p>
        <p class="mt-2">
          If you switch notes folder, a new index will be created for your new
          notes folder. You can switch between multiple notes folders; each will
          have its own independent index.
        </p>
        <p class="mt-2">
          Your current notes folder is: <button
            on:click={() => openInFinder($currentDir)}
            class="link">{notesDir}</button
          >
        </p>
        <button class="mt-2 settings-button" on:click={setNoteDir}
          >change notes folder</button
        >
      </div>

      <div class="mt-5">
        <h1 class="text-2xl">Index folder</h1>
        <p>
          This will run the indexer to index any new files you may have added to
          your notes folder. This is handy if you just cleared your index, or if
          you imported some new text files.
        </p>
        <p class="mt-2">
          When you write in nomad hypertext, your notes are automatically
          indexed. Reindexing is only neccessary if you add files to your notes
          folder from another source.
        </p>
        <p class="mt-2">
          Indexing a large number of documents can take a long time! The app may
          be unresponsive while reindexing.
        </p>
        <button
          class="mt-2 settings-button"
          on:click={async () => {
            showingModal = true;
            //@ts-ignore
            await window.electronAPI.indexDirectory($currentDir);
            showingModal = false;
          }}
          >reindex notes
        </button>
      </div>
      <div class="mt-5">
        <h1 class="text-2xl">Clear index</h1>
        <p>
          This will clear the index used for semantic search. Note: this will
          NOT delete your files, it will only delete the index that is used for
          semantic search. If you change the name of folders or files in your
          notes folder outside of the app, you may have to clear your note index
          and reindex it to make sure the links are accurate.
        </p>
        <button
          class="mt-2 settings-button"
          on:click={() => {
            //@ts-ignore
            window.electronAPI.clearDB();
          }}
          >clear index<button />
        </button>
      </div>
      <div class="mt-5">
        <h1 class="text-2xl">
          <a class="link" href="about">About Nomad Hypertext</a>
        </h1>
      </div>
    </div>
  </div>
</div>
{#if showingModal}
  <div class="absolute top-0 left-0 bg-slate-500 opacity-50 w-full h-full" />
  <dialog
    class="absolute top-0 left-0 w-[36rem] h-4/6 bg-orange-200 mt-12 flex flex-col border border-gray-800"
  >
    <div class="p-5">
      <p>Indexing notes...</p>
      <p>
        This may take a while. If the app is unresponsive for a while, go ahead
        and restart it and try again.
      </p>
    </div>
  </dialog>
{/if}
