import { computePosition } from "@floating-ui/dom";
import { tooltip } from "@svelte-put/tooltip";

export const cTooltip = (node, { content }) => {
  return tooltip(node, {
    content,
    class: "c-tooltip",
    compute: async ({ node, tooltip, content }) => {
      console.log(content);
      const { x, y } = await computePosition(node, tooltip, {
        placement: "right",
      });
      tooltip.style.left = `${x}px`;
      tooltip.style.top = `${y}px`;
    },
  });
};
