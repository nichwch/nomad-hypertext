export const SPLIT_DELIM = "\n";
export const GROUP_DELIM = "~";

export const splitText = (/** @type {string|null|undefined} */ text) => {
  if (text === null || text === undefined) return [];

  const splitByNewLines = text.split(SPLIT_DELIM);

  let processingTilde = false;
  const newArr = [];
  let buffer = [];
  for (let newLine of splitByNewLines) {
    if (newLine.trim() === GROUP_DELIM) {
      if (processingTilde) {
        processingTilde = false;
        newArr.push(buffer.join(SPLIT_DELIM));
        newArr.push(newLine);
        buffer = [];
      } else {
        processingTilde = true;
        newArr.push(newLine);
      }
    } else if (processingTilde) {
      buffer.push(newLine);
    } else newArr.push(newLine);
  }

  if (processingTilde) {
    newArr.push(...buffer);
  }

  return newArr;
};
