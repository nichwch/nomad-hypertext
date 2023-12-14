// place files you want to import through the `$lib` alias in this folder.

import { splitText } from "./splitFunction";

/** @returns {{deleted: string[], created: string[]}} */
export const diffParagraphs = (
  /** @type {string} */ oldContent,
  /** @type {string} */ newContent
) => {
  const oldSegments = Array.from(new Set(splitText(oldContent)));
  const newSegments = Array.from(new Set(splitText(newContent))).filter(
    // filter out commented out blocks
    (segment) => !segment.startsWith("//")
  );

  const oldContentSet = new Set(oldSegments);
  const newContentSet = new Set(newSegments);
  /** @type {string[]} */
  const deleted = oldSegments
    .filter((segment) => {
      return !newContentSet.has(segment);
    })
    .map((segment) => segment.trim());
  /** @type {string[]} */
  const created = newSegments
    .filter((segment) => {
      return !oldContentSet.has(segment);
    })
    .map((segment) => segment.trim());

  return { deleted, created };
};
