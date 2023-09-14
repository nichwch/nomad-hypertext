import { app } from "electron";

const getEmbedding = async (text) => {
  const embedding = await getHFEmbedding(text);
  console.log(embedding);
  return embedding;
};

/** @param {string} text*/
const getHFEmbedding = async (text) => {
  const appPath = app.getAppPath();
  let { pipeline, env } = await import("@xenova/transformers");
  const embeddingFunction = await pipeline(
    "feature-extraction",
    "Supabase/gte-small"
  );
  const embedding = await embeddingFunction(text, {
    pooling: "mean",
    normalize: true,
  });
  return Array.from(embedding);
};
module.exports = { getEmbedding };
