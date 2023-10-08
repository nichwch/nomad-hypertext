const {
  create,
  count,
  insert,
  searchVector,
  search,
  removeMultiple,
} = require("@orama/orama");
const getEmbedding = require("./appEmbeddings.cjs");
const fs = require("fs");
const path = require("path");
const { app } = require("electron");
const log = require("electron-log");

const userDataPath = app.getPath("userData");
const dbPath = `${userDataPath}/.dbfile.msp`;
const lastFetchedDateFile = `${userDataPath}/.lastFetchedDate.txt`;
let db;
let restoreFromFile, persistToFile;
const initDB = async () => {
  //@ts-ignore
  let _ = await import("@orama/plugin-data-persistence/server");
  restoreFromFile = _.restoreFromFile;

  persistToFile = _.persistToFile;
  log.info("initializing database...");
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
  log.log("processing segment");
  segment = segment.trim();
  if (segment.length === 0) return;
  /** @typedef {string[]|null} tags */
  const tags =
    segment.match(/\[\[.*?\]\]/g)?.map((tag) => {
      return tag.replace("[[", "").replace("]]", "");
    }) || [];
  try {
    log.log("attempting to get embedding");
    const embedding = await getEmbedding(segment);
    log.log("got embedding", embedding);
    const entry = {
      parent: fileName,
      tags,
      embedding,
      content: segment,
    };
    await insert(db, entry);
  } catch (e) {
    log.error(e);
  }
};
const accessAndIndexFile = async (filePath) => {
  const file = await fs.readFileSync(filePath, "utf8");
  await indexFile(filePath, file);
};
const indexFile = async (filePath, fileContents) => {
  log.log("filePath being cleared...", filePath);
  const rowsForFile = await searchDBExact("parent", filePath);
  const idsForFile = rowsForFile.map((hit) => hit.id);
  // this does not need to happen synchronously before new insertions!
  // we already have the IDs to delete
  log.log("deleting following rows", rowsForFile, idsForFile);
  await removeMultiple(db, idsForFile);
  const segments = fileContents?.split("\n") || "";
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
  /** @type {Date} */
  let lastFetchedDate;
  try {
    const lastFetchedDateText = fs.readFileSync(lastFetchedDateFile, "utf8");
    lastFetchedDate = new Date(lastFetchedDateText);
  } catch {
    lastFetchedDate = new Date(0);
  }
  log.log("last fetched date:", lastFetchedDate);
  const files = getAllFiles(directory);
  const filesModifiedSinceLastFetch = files.filter((file) => {
    const lastModifiedTime = fs.statSync(file).mtime.getTime();
    return lastModifiedTime > lastFetchedDate.getTime();
  });
  log.log("read directory", files, filesModifiedSinceLastFetch);
  const promises = [];

  // then insert the new entries from the modified files
  for (let file of filesModifiedSinceLastFetch) {
    promises.push(accessAndIndexFile(file));
  }
  try {
    await Promise.all(promises);
  } catch (e) {
    log.error(e);
  } finally {
    if (filesModifiedSinceLastFetch.length > 0) {
      await persistToFile(db, "binary", dbPath);
    }
    fs.writeFileSync(lastFetchedDateFile, new Date().toString());
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
  });
  // orama sometimes doesn't return exact results!! even with exact
  const trueResults = results.hits.filter((result) => {
    return result.document[property] === term;
  });
  return trueResults;
};

/** @param {string} query */
const queryDB = async (query, similarity = 0.8, limit = 10) => {
  const queryEmbedding = await getEmbedding(query);
  log.log("queryEmbedding", queryEmbedding);
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
  fs.writeFileSync(lastFetchedDateFile, new Date(0).toString());
  const dbCount = await count(db);
  log.log(`db has ${dbCount} entries`);
};

module.exports = { db, initDB, indexDirectory, indexFile, queryDB, clearDB };
