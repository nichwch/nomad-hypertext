<script>
  import { page } from "$app/stores";
</script>

{#key $page.url.hash}
  <slot />
{/key}
