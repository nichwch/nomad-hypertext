import { writable } from "svelte/store";

export const prompting = writable(false);
export const displayedPrompt = writable("");
export const promptInput = writable("");
export const submitted = writable(false);

export const promptWithDialogue = async (/** @type {string} */ prompt) => {
  return new Promise((resolve, reject) => {
    /**
     * @type {string}
     */
    let subscribedInput;
    const unsubInput = promptInput.subscribe((val) => (subscribedInput = val));
    prompting.set(true);
    const unsubPrompting = prompting.subscribe((val) => {
      // if the user closes the modal, reject
      if (val === false) {
        reject("modal closed");
      }
    });

    displayedPrompt.set(prompt);
    const unsubSubmitted = submitted.subscribe((submittedVal) => {
      if (submittedVal === true) {
        submitted.set(false);
        prompting.set(false);
        unsubInput();
        unsubSubmitted();
        resolve(subscribedInput);
      }
    });
  });
};
