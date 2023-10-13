<script>
  /** @type {string[]} */
  export let segments = [];
</script>

{#each segments as segment}
  {#if segment.length > 0}
    <div class="relative block">
      {segment}
      <div class="absolute opacity-50 top-0 left-full pl-3 hover:text-red-800">
        test
      </div>
    </div>
  {:else}
    <br />
  {/if}
{/each}
