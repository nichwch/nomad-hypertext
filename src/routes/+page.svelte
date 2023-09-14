<script>
  let noteDir = window.localStorage.getItem("noteDir");
  if (noteDir !== null) {
    // call IPC to make electron open the directory
  }

  const setNoteDir = async () => {
    // call IPC to make electron show dialog
    /** @type {string|undefined}  */
    //@ts-ignore
    const res = await window.electronAPI.openDirectoryPicker();
    if (res) {
      noteDir = res;
      window.localStorage.setItem("noteDir", noteDir);
    }
  };
</script>

<div class="p-2">
  <div>
    <button on:click={setNoteDir}> open folder...</button>
    {#if noteDir !== null}
      <div>browsing {noteDir}</div>
    {/if}
  </div>
  <div><a href="/note1">note 1</a></div>
  <div><a href="/note2">note 2</a></div>
  <div><a href="/note3">note 3</a></div>
</div>
