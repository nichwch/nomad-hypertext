import pg from "pg";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();
const { Client } = pg;
const config = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DB,
};
const client = new Client(config);
await client.connect();
const nicks_id = process.env.NICK_ID;
const { rows } = await client.query(
  `
SELECT note_id, private_content.* FROM private_content LEFT JOIN private_notes ON slate_parent = private_notes.note_id 
WHERE private_notes.author=$1 AND private_content.slate_parent IS NOT NULL ORDER BY slate_index ASC;
`,
  [nicks_id]
);
// console.dir(rows, { depth: null });
// next, parse into text and save as text file
try {
  fs.rmSync("./exegesis", { recursive: true, force: true });
} finally {
  fs.mkdirSync("./exegesis");
  process.chdir("./exegesis");
}
for (const row of rows) {
  const { slate_content } = row;
  const str_content = slate_content?.children
    ?.map((node) => {
      if (node.type === "mention") {
        return `[[${row.tags?.[node.value]}]]`;
      }
      return node?.text || "";
    })
    .join("");
  () => {
    console.log(str_content);
  };
  fs.appendFileSync(`${row.note_id}.txt`, `\n${str_content}`);
}

process.exit(0);
