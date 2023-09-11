import fs from "fs";
import { insert, count } from "@orama/orama";
import { Command } from "commander";
import db from "./db.mjs";
// @ts-ignore
import { persistToFile } from "@orama/plugin-data-persistence/server";
import getEmbedding from "./embedding.mjs";

const program = new Command();
program.option("-d, --directory <directory>");
program.parse();
const options = program.opts();
const { directory } = options;

/**
 * @param {string} segment a segment of text
 * @param {string} fileName the file this segment of text is from
 **/
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
  // console.log(entry);
  await insert(db, entry);
};
if (directory) process.chdir(directory);
const files = fs.readdirSync(`./`);

const promises = [];
for (let file of files) {
  const file_text = fs.readFileSync(file, "utf8");
  const segments = file_text?.split("\n") || "";
  console.log("reading file ", file);
  for (let segment of segments) {
    promises.push(processSegment(segment, file));
  }
}
try {
  await Promise.all(promises);
} finally {
  // need to switch back or we'll save db in wrong place
  if (directory) process.chdir("../");
  await persistToFile(db, "binary", "./.dbfile.msp");
  const dbCount = await count(db);

  console.log(`db has ${dbCount} entries`);
  console.log("done!");
  process.exit(0);
}
