import OpenAI from "openai";
const openai = new OpenAI();

/** @param {string} str */
export default async function getEmbedding(str) {
  const embeddingResponse = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: str,
  });
  const embedding = embeddingResponse.data?.[0].embedding;
  return embedding;
}
