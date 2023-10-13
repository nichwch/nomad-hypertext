<script>
  /** @type {string[]} */
  export let segments = [];
</script>

{#each segments as segment}
  {#if segment.length > 0}
    <div class="relative block text-green-900 opacity-50 bg-green-500">
      {segment}
      <div class="absolute top-0 left-full pl-3">test</div>
    </div>
  {:else}
    <br />
  {/if}
{/each}
