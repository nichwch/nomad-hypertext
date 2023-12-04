<script>
  /**
   * @type {() => void}
   */
  export let refreshResults;
  export let threshold = 70;
  /**
   * @type {(arg0: number) => void}
   */
  export let setThreshold;
  $: {
    setThreshold(threshold);
    refreshResults();
  }
</script>

<div
  class="bg-orange-300 bg-opacity-30 border-b border-b-black px-2 pb-1 bg-texture-orange"
>
  <label class="block py-1">
    <span class="inline-block">similarity threshold: </span>
    <input
      class="bg-orange-200 border border-orange-900 pl-1 text-red-800 mr-0 inline-block"
      type="number"
      bind:value={threshold}
      min={0}
      max={95}
    /><span
      class="text-red-800 px-1 mx-0 bg-orange-200 border border-orange-900 border-l-0 inline-block"
    >
      %
    </span>
  </label>
  <div>
    <button
      class="small-button bg-orange-400 hover:bg-orange-500"
      on:click={() => {
        threshold = 80;
      }}
      >80% (medium)
    </button>
    <button
      class="small-button bg-yellow-400 hover:bg-yellow-500"
      on:click={() => {
        threshold = 85;
      }}
      >85% (strong)
    </button>
    <button
      class="small-button bg-green-400 hover:bg-green-500"
      on:click={() => {
        threshold = 95;
      }}
      >90% (very strong)
    </button>
  </div>
  <div />
</div>
