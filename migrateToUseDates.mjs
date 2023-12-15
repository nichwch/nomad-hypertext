// cursed. do not run.

// import fs from "fs";
// import { insert, count, search, searchVector } from "@orama/orama";
// import getEmbedding from "./embedding.mjs";
// //@ts-ignore
// import { restoreFromFile } from "@orama/plugin-data-persistence/server";

// const path =
//   "/Users/nichwch/Library/Application Support/nomad-hypertext/.dbfile.msp";
// const db = await restoreFromFile("binary", path);
// console.log("restored from file!");

// const allDocuments = await search(db, {
//   properties: "*",
//   limit: 9999,
// });

// // const allDocuments = await searchVector(db, {
// //   vector: [...Array(384).keys()],
// //   property: "embedding",
// //   similarity: 0,
// //   includeVectors: true,
// //   limit: 5000,
// // });

// // console.dir(
// //   allDocuments.hits
// //     .map((doc) => doc.document.embedding)
// //     .filter((em) => em !== null),
// //   { depth: null }
// // );

// const promises = [];

// allDocuments.hits.forEach((hit) => {
//   try {
//     console.log("hit", hit);
//     const parent = hit.document.parent;
//     console.log("PARENT", parent);
//     const parentStats = fs.statSync(parent);
//     console.log(parent, parentStats.birthtime.getTime());
//   } catch (e) {
//     console.log(e);
//   }
// });
