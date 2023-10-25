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

<div>
  <h1>settings</h1>
  <a href="/">back</a>
  <button on:click={setNoteDir}> open folder...</button>
  <div class="float-right">
    <button
      on:click={() => {
        //@ts-ignore
        window.electronAPI.indexDirectory($currentDir);
      }}
      >reindex notes
    </button>
    <button
      on:click={() => {
        //@ts-ignore
        window.electronAPI.clearDB();
      }}
      >clear index<button />
    </button>
  </div>
</div>
