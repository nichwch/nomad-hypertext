<script>
  /**
   * @type {{document:any, score:number}}
   */
  export let result;
</script>

<h1 class="text-sm">
  From: <a
    class="underline"
    href={"note" +
      `?search=${encodeURIComponent(result.document.content)}` +
      "#" +
      result.document.parent}>{result.document.parent?.split("/").pop()}</a
  >
  {#if result.document.editTime}
    <div class="italic">
      {new Date(result.document.editTime).toLocaleString()}
    </div>
  {/if}

  <span class="text-red-800">[{Math.trunc(result.score * 100)}% match]</span>
</h1>
<p class="whitespace-pre-wrap">{result.document.content}</p>
