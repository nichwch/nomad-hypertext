import { pipeline, env } from "@xenova/transformers";

const embeddingFunction = await pipeline(
  "feature-extraction",
  "Supabase/gte-small"
);

/** @param {string} str */
export default async function getEmbedding(str) {
  const embeddingResponse = await embeddingFunction(str, {
    pooling: "mean",
    normalize: true,
  });
  const embedding = embeddingResponse.data;
  return new Float32Array(embedding);
}
