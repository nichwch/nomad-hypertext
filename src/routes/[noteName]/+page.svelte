<script>
  import { page } from "$app/stores";
  import Editor from "../../components/Editor.svelte";
  let notesDir = window.localStorage.getItem("notesDir");
  let contents = "";

  $: if (notesDir) {
    //@ts-ignore
    window.electronAPI.readFile(`${notesDir}/${$page.params.noteName}`).then(
      /** @param {string|undefined} res */
      (res) => {
        if (res) contents = res;
      }
    );
  }
</script>

<Editor {contents} />
