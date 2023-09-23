import { OpenAI } from "openai";
import { pipeline, env } from "@xenova/transformers";

/** @param {string} str */
/* note: changing the embedding function means you have 
  to change the vector size in the db declaration in db.mjs as well
  
  
  openai size: 1536
  HF size: 384
  */
export default async function getEmbedding(str) {
  const embedding = await getHFEmbedding(str);
  return embedding;
}

const openai = new OpenAI();
/** @param {string} str */
async function getOpenAIEmbedding(str) {
  const embeddingResponse = await openai.embeddings.create({
    input: str,
    model: "text-embedding-ada-002",
  });
  const embedding = embeddingResponse?.data?.[0]?.embedding;
  return embedding;
}

const embeddingFunction = await pipeline(
  "feature-extraction",
  "Supabase/gte-small"
);
env.cacheDir = "./.cache";
/** @param {string} str */
async function getHFEmbedding(str) {
  const embeddingResponse = await embeddingFunction(str, {
    pooling: "mean",
    normalize: true,
  });
  const embedding = embeddingResponse.data;
  return Array.from(embedding);
}
