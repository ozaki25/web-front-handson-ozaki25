#!/usr/bin/env node
/**
 * One-time data migration: shuffle each quiz's `choices` array so the
 * `answer` index distributes uniformly across 0..3 in the source data.
 *
 * Background: chapter1〜4 had answer:0 for nearly every question (data
 * authoring habit of placing the correct choice first). This let learners
 * win by pressing key '1' every time. QuizCard.vue masks this at render
 * time with a Fisher-Yates display shuffle, but the underlying data was
 * still skewed. This script fixes the data once and for all, so the
 * source itself reads naturally (no implicit "answer is always first").
 *
 * Usage: node scripts/shuffle-quiz-answers.mjs
 *
 * Idempotency: re-running re-shuffles. That's OK because the source
 * shouldn't be regenerated automatically anyway; once we commit a balanced
 * version we leave it alone.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "..", "docs", "quiz", "data");

function fisherYates(n) {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Extract the JS array literal portion of a chapter file by stripping the
 * `import type` line and the `export const xN: Quiz[] = ` prefix, leaving
 * a parseable expression.
 */
function parseChapter(text) {
  const m = text.match(
    /export const \w+\s*:\s*Quiz\[\]\s*=\s*(\[[\s\S]+\]);?\s*$/,
  );
  if (!m) throw new Error("could not find Quiz[] export");
  // The contents are TS-flavored object literals (trailing commas, no
  // quoted keys, unicode strings). Function constructor with `return`
  // parses them as JS — JS supports trailing commas, unquoted keys, and
  // multi-line strings just fine in object/array literals.
  // eslint-disable-next-line no-new-func
  const arr = new Function(`return (${m[1]});`)();
  return arr;
}

/**
 * Serialize a single quiz object back to the project's source style:
 * - 2-space indent, double-quoted strings
 * - unquoted property keys
 * - trailing comma after the last property
 * - `choices` items on their own lines
 */
function serializeQuiz(q, indent = "  ") {
  const ind1 = indent;
  const ind2 = indent + "  ";
  const ind3 = indent + "    ";
  const lines = [];
  lines.push(`${ind1}{`);
  lines.push(`${ind2}id: ${JSON.stringify(q.id)},`);
  if (q.lesson != null) lines.push(`${ind2}lesson: ${JSON.stringify(q.lesson)},`);
  lines.push(`${ind2}difficulty: ${JSON.stringify(q.difficulty)},`);
  lines.push(`${ind2}question: ${JSON.stringify(q.question)},`);
  lines.push(`${ind2}choices: [`);
  for (const c of q.choices) lines.push(`${ind3}${JSON.stringify(c)},`);
  lines.push(`${ind2}],`);
  lines.push(`${ind2}answer: ${q.answer},`);
  // explanation may be long; emit on a single JSON-string line to keep
  // the format simple. The build step doesn't care about wrap width.
  lines.push(`${ind2}explanation: ${JSON.stringify(q.explanation)},`);
  // Forward any other unknown fields verbatim (defensive).
  for (const k of Object.keys(q)) {
    if (
      [
        "id",
        "lesson",
        "difficulty",
        "question",
        "choices",
        "answer",
        "explanation",
      ].includes(k)
    )
      continue;
    lines.push(`${ind2}${k}: ${JSON.stringify(q[k])},`);
  }
  lines.push(`${ind1}},`);
  return lines.join("\n");
}

function buildChapterFile(varName, quizzes) {
  const body = quizzes.map((q) => serializeQuiz(q)).join("\n");
  return `import type { Quiz } from "../types";

export const ${varName}: Quiz[] = [
${body}
];
`;
}

const files = readdirSync(dataDir).filter((f) =>
  /^chapter\d+\.ts$/.test(f),
);

let totalShuffled = 0;
for (const file of files) {
  const path = join(dataDir, file);
  const text = readFileSync(path, "utf8");
  const varName = file.replace(/\.ts$/, "");
  const quizzes = parseChapter(text);
  const before = quizzes.map((q) => q.answer);
  for (const q of quizzes) {
    if (!Array.isArray(q.choices) || q.choices.length < 2) continue;
    const correctText = q.choices[q.answer];
    const order = fisherYates(q.choices.length);
    const newChoices = order.map((i) => q.choices[i]);
    const newAnswer = newChoices.indexOf(correctText);
    if (newAnswer < 0) throw new Error(`${file} ${q.id}: lost correct answer`);
    q.choices = newChoices;
    q.answer = newAnswer;
    totalShuffled++;
  }
  const after = quizzes.map((q) => q.answer);
  const counts = [0, 0, 0, 0];
  for (const a of after) counts[a]++;
  console.log(
    `${file}: ${quizzes.length} quizzes → answer distribution A:${counts[0]} B:${counts[1]} C:${counts[2]} D:${counts[3]} (was mostly ${[...new Set(before)].join(",")})`,
  );
  writeFileSync(path, buildChapterFile(varName, quizzes), "utf8");
}

console.log(`\nDone. Reshuffled ${totalShuffled} quizzes across ${files.length} files.`);
