<script>
  import { cTooltip } from "$lib/tooltip";

  export let searchResults;
  /**
   * @type {number}
   */
  export let threshold;

  $: range = 100 - threshold;
  $: divisions = range / 10;
  $: cutoffs = [...Array(10).keys()]
    .map((i) => {
      return threshold + i * divisions;
    })
    .reverse();
  const RESET_ARR = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  let frequencies = RESET_ARR;
  $: {
    frequencies = frequencies.map((i) => 0);
    for (const entry of searchResults) {
      const score = entry.score * 100;
      for (let i = 1; i < cutoffs.length; i++) {
        if (score >= cutoffs[i]) {
          frequencies[i - 1]++;
          break;
        }
      }
    }
    frequencies = frequencies;
  }
</script>

<div class="flex w-full h-4 border-b border-b-black">
  {#each frequencies as freq, index}
    {@const percentage = freq / searchResults.length}
    {@const startingCutoff = cutoffs[index].toFixed(1)}
    {@const endingCutoff = (cutoffs[index] + divisions).toFixed(1)}
    <!-- need the key block or else the tooltip won't update -->
    {#key frequencies}
      <div
        use:cTooltip={{
          content: `${freq} between ${startingCutoff} and ${endingCutoff}`,
          placement: "bottom",
        }}
        class="border-r border-r-black flex-1"
      >
        <div
          style:opacity={(percentage + 0.3).toFixed(1)}
          class="bg-red-700 w-full h-full"
        />
      </div>
    {/key}
  {/each}
</div>
