import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.resolve(scriptDirectory, "..");
const inputPath = path.join(
  projectDirectory,
  "temp",
  "PEPXiaoXue6_1.json",
);
const outputPath = path.join(
  path.dirname(inputPath),
  `${path.parse(inputPath).name}.csv`,
);

function parseRecords(source) {
  const text = source.trim();

  if (!text) {
    return [];
  }

  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    const records = [];
    let start = -1;
    let depth = 0;
    let inString = false;
    let escaped = false;

    for (let index = 0; index < text.length; index += 1) {
      const character = text[index];

      if (start === -1) {
        if (/\s/.test(character)) {
          continue;
        }

        if (character !== "{" && character !== "[") {
          throw new Error(`位置 ${index} 不是 JSON 对象或数组的起始位置`);
        }

        start = index;
      }

      if (inString) {
        if (escaped) {
          escaped = false;
        } else if (character === "\\") {
          escaped = true;
        } else if (character === '"') {
          inString = false;
        }

        continue;
      }

      if (character === '"') {
        inString = true;
      } else if (character === "{" || character === "[") {
        depth += 1;
      } else if (character === "}" || character === "]") {
        depth -= 1;

        if (depth === 0) {
          records.push(JSON.parse(text.slice(start, index + 1)));
          start = -1;
        }
      }
    }

    if (start !== -1 || depth !== 0 || inString) {
      throw new Error("JSON 文件末尾存在未闭合的数据");
    }

    return records.flatMap((record) =>
      Array.isArray(record) ? record : [record],
    );
  }
}

function escapeCsv(value) {
  const text = String(value ?? "");

  if (/[",\r\n]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
}

const source = await readFile(inputPath, "utf8");
const records = parseRecords(source);
const header = ["wordRank", "headWord", "content", "bookId"];
const rows = records.map((record) => [
  record.wordRank,
  record.headWord,
  JSON.stringify(record.content ?? null),
  record.bookId,
]);
const csv = [header, ...rows]
  .map((row) => row.map(escapeCsv).join(","))
  .join("\n");

await writeFile(outputPath, `${csv}\n`, "utf8");

console.log(`已转换 ${records.length} 条数据：${outputPath}`);
