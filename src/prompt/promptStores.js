import { writable } from "svelte/store";

/** @type {import("svelte/store").Writable<boolean|'INPUT'|'CONFIRMATION'>}  */
export const prompting = writable(false);
export const displayedPrompt = writable("");
export const promptInput = writable("");
export const submitted = writable(false);
/** @type {import("svelte/store").Writable<null|boolean>} */
export const promptConfirmation = writable(null);

export const promptWithDialogue = async (/** @type {string} */ prompt) => {
  return new Promise((resolve, reject) => {
    /**
     * @type {string}
     */
    let subscribedInput;
    promptInput.set("");
    const unsubInput = promptInput.subscribe((val) => (subscribedInput = val));
    prompting.set("INPUT");
    prompting.subscribe((val) => {
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

export const promptForConfirmation = async (/** @type {string} */ prompt) => {
  return new Promise((resolve, reject) => {
    prompting.set("CONFIRMATION");
    displayedPrompt.set(prompt);
    prompting.subscribe((val) => {
      // if the user closes the modal, reject
      if (val === false) {
        resolve(false);
      }
    });

    promptConfirmation.set(null);
    displayedPrompt.set(prompt);
    const unsubConfirmation = promptConfirmation.subscribe((val) => {
      console.log("valll", val);
      if (val === null) return;
      prompting.set(false);
      unsubConfirmation();
      resolve(val);
    });
  });
};
