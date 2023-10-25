<script>
  import { currentDir } from "../currentDirStore";
  let notesDir = window.localStorage.getItem("notesDir");
  const setNoteDir = async () => {
    // call IPC to make electron show dialog
    /** @type {string|undefined}  */
    //@ts-ignore
    const res = await window.electronAPI.openDirectoryPicker();
    if (res) {
      notesDir = res;
      $currentDir = notesDir;
      window.localStorage.setItem("notesDir", notesDir);
    }
  };
</script>

<div class="flex-grow flex flex-col overflow-y-auto">
  <div class="border-b border-b-gray-800 px-2">
    <a href="/">back</a>
    <h1 class="float-right">settings</h1>
  </div>
  <div class="overflow-y-auto">
    <div class="w-[36rem] mx-auto py-10">
      <div>
        <h1 class="text-2xl">Notes folder</h1>
        <p>
          Your notes folder are where all your notes are created and stored. It
          is also where the semantic search index will be created. Notes inside
          of your notes folder can be searched, notes outside cannot.
        </p>
        <p class="mt-2">Your current notes folder is: {notesDir}</p>
        <button
          class="mt-2 bg-orange-300 border border-gray-500 px-2"
          on:click={setNoteDir}>change notes folder</button
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
          class="bg-orange-300 border border-gray-500 px-2"
          on:click={() => {
            //@ts-ignore
            window.electronAPI.indexDirectory($currentDir);
          }}
          >reindex notes
        </button>
      </div>
      <div class="mt-5">
        <h1 class="text-2xl">Clear index</h1>
        <p>
          This will clear the index used for semantic search. Note: this will
          NOT delete your files, it will only delete the index that is used for
          semantic search. If you change your note folder, or you change the
          name of folders or files in your notes folder, you may have to clear
          your note index and reindex it to make sure the links are accurate.
        </p>
        <button
          class="mt-2 bg-orange-300 border border-gray-500 px-2"
          on:click={() => {
            //@ts-ignore
            window.electronAPI.clearDB();
          }}
          >clear index<button />
        </button>
      </div>
    </div>
  </div>
</div>
