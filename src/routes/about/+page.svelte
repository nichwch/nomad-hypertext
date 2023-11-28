<script>
  import DraggableCard from "../../DraggableCard.svelte";
</script>

<div class="p-10">
  <!-- <h1 class="text-5xl">nomad <span class="text-red-800">hypertext</span></h1> -->
  <div class="text-xs font-extrabold">
    <pre>
 __    _  _______  __   __  _______  ______     __   __  __   __  _______  _______  ______    _______  _______  __   __  _______ 
|  |  | ||       ||  |_|  ||   _   ||      |   |  | |  ||  | |  ||       ||       ||    _ |  |       ||       ||  |_|  ||       |
|   |_| ||   _   ||       ||  |_|  ||  _    |  |  |_|  ||  |_|  ||    _  ||    ___||   | ||  |_     _||    ___||       ||_     _|
|       ||  | |  ||       ||       || | |   |  |       ||       ||   |_| ||   |___ |   |_||_   |   |  |   |___ |       |  |   |  
|  _    ||  |_|  ||       ||       || |_|   |  |       ||_     _||    ___||    ___||    __  |  |   |  |    ___| |     |   |   |  
| | |   ||       || ||_|| ||   _   ||       |  |   _   |  |   |  |   |    |   |___ |   |  | |  |   |  |   |___ |   _   |  |   |  
|_|  |__||_______||_|   |_||__| |__||______|   |__| |__|  |___|  |___|    |_______||___|  |_|  |___|  |_______||__| |__|  |___|  
  
</pre>
  </div>
  <h1 class="text-5xl mt-3 text-red-800">超文本</h1>

  <DraggableCard posX={60} posY={60}>
    <div>Made by Nicholas Chen</div>
  </DraggableCard>
  <DraggableCard posX={80} posY={80}>
    <div>
      <h1>Thanks to:</h1>
      <p>The Recurse Center, for reigniting my love of programming.</p>
      <p>
        Gordon Brander, for inspiring me with his essay, "Links are all you
        need"
      </p>
      <p>
        Linus Lee, for inspiring me with his essay, "Hyperlink maximalism", and
        his incredible prototype, Notation
      </p>
      <p>Leo Shimonaka, for Unix-pilling me</p>
      <p>Everyone who used exegesis and supported me over the years.</p>
    </div>
  </DraggableCard>
  <DraggableCard posX={100} posY={100}>
    <div>Made by Nicholas Chen</div>
  </DraggableCard>
</div>
