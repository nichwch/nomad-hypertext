import { count, create } from "@orama/orama";
import {
  restoreFromFile,
  persistToFile,
  // @ts-ignore
} from "@orama/plugin-data-persistence/server";
let db;

try {
  db = await restoreFromFile("binary", "./.dbfile.msp");
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
  await persistToFile(db, "binary", "./.dbfile.msp");
} finally {
  const dbCount = await count(db);
  console.log(`db has ${dbCount} entries`);
}

export default db;
