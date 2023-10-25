<script>
  import { page } from "$app/stores";
</script>

<div class="h-full w-full flex flex-col">
  <div class="w-full py-1 px-2 border-b border-b-gray-700">
    <a href="/">back </a>
    <span class="float-right">
      editing {$page.params.noteName}
    </span>
  </div>
  <slot />
</div>
