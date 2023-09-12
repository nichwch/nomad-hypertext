<script lang="js">
  import Editor from "../components/Editor.svelte";
  import "../global.css";
  let count = 0;
</script>

<h1>Welcome to rhizome</h1>
<div class="border border-black">style test</div>
<button
  on:click={() => {
    count++;
  }}>increment {count}</button
>
<Editor />
