import pdfjsLib from "pdfjs-dist";
import OpenAI from "openai";
import fs from "fs";

const openai = new OpenAI();
const path = "mediummessage.pdf";
let doc = await pdfjsLib.getDocument(path).promise;

try {
  fs.rmSync("./mediummessage", { recursive: true, force: true });
} finally {
  fs.mkdirSync("./mediummessage");
  process.chdir("./mediummessage");
}

const processPage = async (i) => {
  let page = await doc.getPage(i);
  let content = await page.getTextContent();
  let strings = content.items.map((item) => {
    if ("str" in item) return item.str;
    else return "";
  });
  const uncorrected_page_text = strings.join("");
  console.log("\n\n\n\nuncorrected text=============");
  console.log(uncorrected_page_text);
  const resp = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: `The following text  as been scanned from a PDF, and has some mistakes in it. Please correct them. Be sure to correct typos, remove unneccesary newlines, and add new lines where they make sense. Repeat back the following text, but without mistakes. Do not repeat the prompt back 
${uncorrected_page_text}`,
      },
    ],
  });
  console.log("===============");
  const text_resp = resp.choices?.[0].message.content || "request failed";
  console.log("text_resp", text_resp);
  fs.appendFileSync(`page${i}.txt`, text_resp);
};

const promiseArr = [];
for (let i = 1; i <= doc.numPages; i++) {
  promiseArr.push(processPage(i));
}
await Promise.all(promiseArr);

process.chdir("..");
process.exit(0);
