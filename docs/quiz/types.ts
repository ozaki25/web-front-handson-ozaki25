export type ChapterId = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type Difficulty = "easy" | "normal" | "hard";

export type Quiz = {
  id: string;
  lesson: string;
  difficulty: Difficulty;
  question: string;
  choices: [string, string, string, string];
  answer: 0 | 1 | 2 | 3;
  explanation: string;
};

export type ChapterMeta = {
  id: ChapterId;
  title: string;
  lessonRange: [string, string];
};

export const chapters: ChapterMeta[] = [
  { id: 1, title: "HTML / CSS", lessonRange: ["lesson01", "lesson17"] },
  { id: 2, title: "JavaScript", lessonRange: ["lesson18", "lesson40"] },
  { id: 3, title: "TypeScript", lessonRange: ["lesson41", "lesson51"] },
  { id: 4, title: "React", lessonRange: ["lesson52", "lesson69"] },
  { id: 5, title: "Next.js", lessonRange: ["lesson70", "lesson91"] },
  { id: 6, title: "ブラウザの仕組み", lessonRange: ["lesson92", "lesson97"] },
  { id: 7, title: "実務で使う周辺知識", lessonRange: ["lesson98", "lesson137"] },
];
