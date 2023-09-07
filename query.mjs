import { count, searchVector, search } from "@orama/orama";
import { Command } from "commander";
import db from "./db.mjs";
import OpenAI from "openai";

const openai = new OpenAI();
const program = new Command();
program.option("-q, --query <query>");
program.parse();
const options = program.opts();
const { query } = options;
console.log("options", options);
const dbCount = await count(db);
console.log(`db has ${dbCount} entries`);
const queryResponse = await openai.embeddings.create({
  model: "text-embedding-ada-002",
  input: query,
});
const queryEmbedding = queryResponse.data?.[0].embedding;

const results = await searchVector(db, {
  vector: queryEmbedding,
  property: "embedding",
  similarity: 0.8,
  limit: 10,
});
results.hits.forEach((hit) => {
  console.log(`score: ${hit.score}, from ${hit.document?.parent}`);
  console.log("=============================");
  console.log(hit.document?.content);
  console.log("=============================\n\n");
});
process.exit(0);
