<script lang="js">
  const noteDir = window.localStorage.getItem("noteDir");
  if (noteDir !== null) {
    // call IPC to make electron open the directory
  }

  const setNoteDir = () => {
    // call IPC to make electron show dialog
    //@ts-ignore
    window.electronAPI.openDirectoryPicker();
  };
  let count = 0;
</script>

<div class="p-2">
  <div>
    {#if noteDir === null}
      <button on:click={setNoteDir}> open folder...</button>
    {/if}
  </div>
  <div><a href="/note1">note 1</a></div>
  <div><a href="/note2">note 2</a></div>
  <div><a href="/note3">note 3</a></div>
</div>
