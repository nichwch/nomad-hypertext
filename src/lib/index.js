// place files you want to import through the `$lib` alias in this folder.
/** @returns {{deleted: string[], created: string[]}} */
export const diffParagraphs = (
  /** @type {string} */ oldContent,
  /** @type {string} */ newContent
) => {
  const oldSegments = Array.from(new Set(oldContent.split("\n")));
  const newSegments = Array.from(new Set(newContent.split("\n"))).filter(
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
