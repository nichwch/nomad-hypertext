import { OpenAI } from "openai";
import { pipeline, env } from "@xenova/transformers";

/** @param {string} str */
export default async function getEmbedding(str) {
  return await getOpenAIEmbedding(str);
}

const openai = new OpenAI();
/** @param {string} str */
async function getOpenAIEmbedding(str) {
  const embeddingResponse = await openai.embeddings.create({
    input: str,
    model: "text-embedding-ada-002",
  });
  const embedding = embeddingResponse?.data?.[0]?.embedding;
  return new Float32Array(embedding);
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
  return new Float32Array(embedding);
}
