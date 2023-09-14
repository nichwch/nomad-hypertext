const { create, count, insert, searchVector } = require("@orama/orama");
const getEmbedding = require("./appEmbeddings.cjs");
const fs = require("fs");
const {
  restoreFromFile,
  persistToFile,
} = require("@orama/plugin-data-persistence");
const { app } = require("electron");
const userDataPath = app.getPath("userData");
const dbPath = `${userDataPath}/.dbfile.msp`;
let db;
const initDB = async () => {
  try {
    db = await restoreFromFile("binary", dbPath);
    console.log("db restored from file");
  } catch {
    console.log("no db file found, creating new db");
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
    console.log(`db has ${dbCount} entries`);
  }
};

const processSegment = async (segment, fileName) => {
  segment = segment.trim();
  if (segment.length === 0) return;
  /** @typedef {string[]|null} tags */
  const tags =
    segment.match(/\[\[.*?\]\]/g)?.map((tag) => {
      return tag.replace("[[", "").replace("]]", "");
    }) || [];
  const embedding = await getEmbedding(segment);
  const entry = {
    parent: fileName,
    tags,
    embedding,
    content: segment,
  };
  await insert(db, entry);
};

const indexDirectory = async (directory) => {
  const files = fs.readdirSync(directory);
  const promises = [];
  for (let file of files) {
    const file_text = fs.readFileSync(file, "utf8");
    const segments = file_text?.split("\n") || "";
    for (let segment of segments) {
      promises.push(processSegment(segment, file));
    }
  }
  try {
    await Promise.all(promises);
  } finally {
    await persistToFile(db, "binary", dbPath);
    const dbCount = await count(db);
    console.log(`db has ${dbCount} entries`);
  }
};

/** @param {string} query */
const queryDB = async (query, similarity = 0.8, limit = 10) => {
  const queryEmbedding = await getEmbedding(query);
  const results = await searchVector(db, {
    vector: queryEmbedding,
    property: "embedding",
    similarity,
    limit,
  });
  return results;
};
module.exports = { db, initDB, indexDirectory };
