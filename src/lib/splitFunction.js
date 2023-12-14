export const SPLIT_DELIM = "\n";
export const GROUP_DELIM = "~";

export const splitText = (/** @type {string|null|undefined} */ text) => {
  if (text === null || text === undefined) return [];
  // for now, just return split with new lines
  return text.split(SPLIT_DELIM);
};
