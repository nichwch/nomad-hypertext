const {
  create,
  count,
  insert,
  searchVector,
  search,
  removeMultiple,
  getByID,
  updateMultiple,
  update,
} = require("@orama/orama");
const getEmbedding = require("./appEmbeddings.cjs");
const fs = require("fs");
const path = require("path");
const { app } = require("electron");
const log = require("electron-log");
const {
  GET_SETTINGS_FILE,
  LAST_FETCHED_DATE_FILE,
  SET_SETTINGS_FILE,
  NOTE_DIR_FILE,
} = require("./settings.cjs");

const userDataPath = app.getPath("userData");
console.log("USER DATA PATH", userDataPath);

let notesDir = GET_SETTINGS_FILE(NOTE_DIR_FILE);
let dbPath = `${notesDir}/.dbfile.msp`;
let db;
let restoreFromFile, persistToFile;
let GROUP_DELIM;

const initDB = async () => {
  notesDir = GET_SETTINGS_FILE(NOTE_DIR_FILE);
  dbPath = `${notesDir}/.dbfile.msp`;
  // if there is no note folder, do not initialize
  // initDB will be called when a note folder is selected
  if (
    notesDir === null ||
    notesDir === undefined ||
    notesDir.trim().length === 0
  )
    return;
  //@ts-ignore
  let _ = await import("@orama/plugin-data-persistence/server");
  GROUP_DELIM = (await import("./src/lib/splitFunction.js")).GROUP_DELIM;
  restoreFromFile = _.restoreFromFile;

  persistToFile = _.persistToFile;
  log.info("initializing database...");
  log.log("dbPath", dbPath);
  log.log("notesDir", notesDir);
  try {
    db = await restoreFromFile("binary", dbPath);
    log.log("db restored from file");
  } catch {
    log.log("no db file found, creating new db");
    db = await create({
      schema: {
        parent: "string",
        tags: "string[]",
        embedding: "vector[384]",
        content: "string",
        // unix timestamp
        editDate: "number",
      },
      id: "oramadb",
    });
    await persistToFile(db, "binary", dbPath);
  } finally {
    //@ts-ignore
    const dbCount = await count(db);
    log.log(`db has ${dbCount} entries`);
  }
};

const processSegment = async (segment, fileName) => {
  segment = segment.trim();
  if (segment.length === 0) return;
  if (segment === GROUP_DELIM) return;
  segmentCount++;
  const thisSegment = segmentCount;
  log.log("processing segment", segmentCount);
  /** @typedef {string[]|null} tags */
  const tags =
    segment.match(/\[\[.*?\]\]/g)?.map((tag) => {
      return tag.replace("[[", "").replace("]]", "");
    }) || [];
  try {
    // log.log("attempting to get embedding");
    const embedding = await getEmbedding(segment);
    // log.log("got embedding", embedding);
    const entry = {
      parent: fileName,
      tags,
      embedding,
      content: segment,
      editTime: new Date().getTime(),
    };
    await insert(db, entry);
    log.log(`inserted segment ${thisSegment} successfully`);
  } catch (e) {
    log.error(e);
  }
};
const accessAndIndexFile = async (filePath) => {
  const file = await fs.readFileSync(filePath, "utf8");
  await indexFile(filePath, file);
};
/** Deletes all indices for a given note, then creates new indices for it
 * @returns {Promise<void>}
 */
const deleteIndicesForFile = async (filePath) => {
  const rowsForFile = await searchDBExact("parent", filePath);
  const idsToDelete = rowsForFile.map((row) => row.id);
  await removeMultiple(db, idsToDelete, undefined, undefined, true);
};

const renameIndicesForFile = async (filePath, newPath) => {
  const rowsForFile = await searchDBExact("parent", filePath);
  const idsToDelete = rowsForFile.map((row) => row.id);
  /*
We cannot reuse the embedding because OramaDB does not return it, for whatever reason
I have tried repeatedly to try and get the previous embedding to avoid the overhead 
of reembedding content that has not changed. This is the only way for now.
*/
  const cloneDocWithNewEmbedding = async (row) => {
    const embedding = await getEmbedding(row.document.content);
    const document = { ...row.document, embedding, parent: newPath };
    return document;
  };

  const newDocs = await Promise.all(
    rowsForFile.map((row) => cloneDocWithNewEmbedding(row))
  );

  await updateMultiple(
    db,
    idsToDelete,
    newDocs,
    idsToDelete.length,
    undefined,
    true
  );
};

const reindexFile = async (
  /** @type {string} */ filePath,
  /** @type {string[]} */ deletedContent,
  /** @type {string[]} */ newContent
) => {
  log.log("reindexing ", filePath, newContent, deletedContent);
  log.log("newContent", newContent);
  log.log("deletedContent", deletedContent);
  const rowsForFile = await searchDBExact("parent", filePath);
  const rowsToDelete = rowsForFile.filter((row) => {
    if (deletedContent.includes(row.document.content)) return true;
    return false;
  });
  console.log("rowsForFile", rowsForFile);
  console.log("deleting...", rowsToDelete);
  console.log("creating...", newContent);
  const idsToDelete = rowsToDelete.map((hit) => hit.id);
  console.log("idsToDelete", idsToDelete);
  await removeMultiple(db, idsToDelete, undefined, undefined, true);
  log.log("indexing following contents...", newContent);
  const promises = [];
  for (let segment of newContent) {
    promises.push(processSegment(segment, filePath));
  }
  await Promise.all(promises);
  await persistToFile(db, "binary", dbPath);
  SET_SETTINGS_FILE(LAST_FETCHED_DATE_FILE, new Date().toString());
};

let segmentCount = 0;

const indexFile = async (filePath, fileContents) => {
  log.log("filePath being cleared...", filePath);
  const rowsForFile = await searchDBExact("parent", filePath);
  const idsForFile = rowsForFile.map((hit) => hit.id);
  // this does not need to happen synchronously before new insertions!
  // we already have the IDs to delete
  log.log("deleting following rows", rowsForFile, idsForFile);
  removeMultiple(db, idsForFile, undefined, undefined, true);
  const segments = (await import("./src/lib/splitFunction.js")).splitText(
    fileContents
  );
  log.log("indexing following contents...", segments, fileContents);
  const promises = [];
  for (let segment of segments) {
    promises.push(processSegment(segment, filePath));
  }
  await Promise.all(promises);
};
// /** @param {string} dirPath  */
/** @param {string[]} files  */
/** @returns {string[]}  */
const getAllFiles = (dirPath, files = []) => {
  const entries = fs.readdirSync(dirPath);

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, files);
    } else {
      files.push(fullPath);
    }
  }

  return files;
};

const indexDirectory = async (directory) => {
  log.log("indexing directory...");
  const { default: pLimit } = await import("p-limit");
  /** @type {Date} */
  let lastFetchedDate;
  try {
    const lastFetchedDateText = GET_SETTINGS_FILE(LAST_FETCHED_DATE_FILE);
    // @ts-ignore
    lastFetchedDate = new Date(lastFetchedDateText);
  } catch {
    lastFetchedDate = new Date(0);
  }
  log.log("last fetched date:", lastFetchedDate);
  const files = getAllFiles(directory);
  const filesModifiedSinceLastFetch = files.filter((file) => {
    const extension = file.split(".").pop();
    // don't index hidden files
    if (extension?.[0] === ".") return false;
    // don't index txt or md files
    if (extension !== "txt" && extension !== "md") return false;
    const lastModifiedTime = fs.statSync(file).mtime.getTime();
    return lastModifiedTime > lastFetchedDate.getTime();
  });
  const promises = [];

  // then insert the new entries from the modified files
  // batch these 4 files at a time
  // doing it completely parallel crashes everything
  const limit = pLimit(5);
  for (let file of filesModifiedSinceLastFetch) {
    promises.push(limit(() => accessAndIndexFile(file)));
  }
  try {
    await Promise.all(promises);
  } catch (e) {
    log.error(e);
  } finally {
    if (filesModifiedSinceLastFetch.length > 0) {
      await persistToFile(db, "binary", dbPath);
    }
    SET_SETTINGS_FILE(LAST_FETCHED_DATE_FILE, new Date().toString());
    const dbCount = await count(db);
    log.log(`db has ${dbCount} entries`);
  }
};

/** @param {string}  property*/
/** @param {string}  term*/
const searchDBExact = async (property, term) => {
  const results = await search(db, {
    term,
    properties: [property],
    exact: true,
    limit: 9999,
  });
  // log.log("blurry results");
  // log.log(results.hits.map((res) => res.document[property]));
  // orama sometimes doesn't return exact results!! even with exact
  const trueResults = results.hits.filter((result) => {
    return result.document[property] === term;
  });
  log.log("true results", trueResults);
  return trueResults;
};

/** @param {string} query */
const queryDB = async (query, similarity = 0.7, limit = 1000) => {
  const queryEmbedding = await getEmbedding(query);
  const results = await searchVector(db, {
    vector: queryEmbedding,
    property: "embedding",
    similarity,
    limit,
  });
  return results;
};

const clearDB = async () => {
  log.log("clearing db...");
  db = await create({
    schema: {
      parent: "string",
      tags: "string[]",
      embedding: "vector[384]",
      content: "string",
    },
    id: "oramadb",
  });
  await persistToFile(db, "binary", dbPath);
  // reset last fetched date
  SET_SETTINGS_FILE(LAST_FETCHED_DATE_FILE, new Date(0).toString());
  const dbCount = await count(db);
  log.log(`db has ${dbCount} entries`);
};

const printAllDocuments = async () => {
  log.log("printing all docs...");
  const results = await search(db, { limit: 100000 });
  console.dir(
    results.hits.map((res) => ({
      parent: res.document.parent,
      content: res.document.content,
    })),
    { depth: null, maxArrayLength: Infinity }
  );
};

module.exports = {
  db,
  initDB,
  indexDirectory,
  indexFile,
  reindexFile,
  queryDB,
  clearDB,
  deleteIndicesForFile,
  printAllDocuments,
  renameIndicesForFile,
};
