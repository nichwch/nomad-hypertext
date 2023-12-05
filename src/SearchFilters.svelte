<script>
  import { SORT_OPTIONS } from "./routes/[...noteName]/sortConstants";

  /**
   * @type {() => void}
   */
  export let refreshResults;
  /**
   * @type {number}
   */
  export let threshold;
  /**
   * @type {(arg0: number) => void}
   */
  export let setThreshold;
  /**
   * @type {string}
   */
  export let sortCriteria;
  /**
   * @type {(arg0: string) => void}
   */
  export let setSortCriteria;
  $: {
    setThreshold(threshold);
    setSortCriteria(sortCriteria);
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
      min={50}
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
  <label class="block mt-3">
    sort by:
    <select bind:value={sortCriteria} class="bg-orange-200 border border-black">
      {#each SORT_OPTIONS as sortOption}
        <option value={sortOption}>{sortOption}</option>
      {/each}
    </select>
  </label>
  <div />
</div>
