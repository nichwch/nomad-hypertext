<script>
  export let posX = 0;
  export let posY = 0;
  let dragging = false;

  function dragStart(event) {
    dragging = true;
    posX = event.clientX - event.target.getBoundingClientRect().left;
    posY = event.clientY - event.target.getBoundingClientRect().top;
  }

  function dragEnd() {
    dragging = false;
  }

  function draggingCard(event) {
    if (dragging) {
      event.target.style.left = `${event.clientX - posX}px`;
      event.target.style.top = `${event.clientY - posY}px`;
    }
  }
</script>

<div
  style:left={posX}
  style:top={posY}
  class="absolute w-96 h-52 border border-black p-5 cursor-pointer select-none bg-orange-300"
  on:mousedown={dragStart}
  on:mousemove={draggingCard}
  on:mouseup={dragEnd}
  on:mouseleave={dragEnd}
  role="presentation"
>
  <slot />
</div>
