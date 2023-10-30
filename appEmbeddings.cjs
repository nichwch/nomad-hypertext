const { app } = require("electron");
const log = require("electron-log");
const getEmbedding = async (text) => {
  const embedding = await getHFEmbedding(text);
  return embedding;
};

/** @param {string} text*/
const getHFEmbedding = async (text) => {
  const appPath = app.getAppPath();
  let { pipeline, env } = await import("@xenova/transformers");
  env.cacheDir = `${appPath}/.cache`;
  const embeddingFunction = await pipeline(
    "feature-extraction",
    "Supabase/gte-small"
  );
  const embeddingResponse = await embeddingFunction(text, {
    pooling: "mean",
    normalize: true,
  });
  const embedding = embeddingResponse.data;
  return Array.from(embedding);
};
module.exports = getEmbedding;
