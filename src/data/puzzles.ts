
export type Difficulty = "Easy" | "Medium" | "Hard";

export interface Puzzle {
  words: string[];
  answer: string;
  hint: string;
}

export const puzzles: Record<Difficulty, Puzzle[]> = {
  Easy: [
    {
      words: ["Crown", "Throne", "Castle", "Monarch"],
      answer: "king",
      hint: "Think of someone who rules a kingdom.",
    },
    {
      words: ["Piano", "Guitar", "Drums", "Violin"],
      answer: "instruments",
      hint: "These are all used to make music.",
    },
    {
      words: ["Winter", "Spring", "Summer", "Fall"],
      answer: "seasons",
      hint: "There are four of these in a year.",
    },
  ],

  Medium: [
    {
      words: ["Mercury", "Venus", "Earth", "Mars"],
      answer: "planets",
      hint: "These are part of our solar system.",
    },
    {
      words: ["Novel", "Poem", "Drama", "Essay"],
      answer: "writing",
      hint: "These are different forms of written work.",
    },
    {
      words: ["Pixel", "Screen", "Keyboard", "Mouse"],
      answer: "computer",
      hint: "Think about the device these are associated with.",
    },
  ],

  Hard: [
    {
      words: ["Draft", "Current", "Vent", "Gust"],
      answer: "air",
      hint: "You cannot see it, but you can feel it move.",
    },
    {
      words: ["Bass", "Treble", "Pitch", "Tone"],
      answer: "sound",
      hint: "These describe qualities of what you hear.",
    },
    {
      words: ["Margin", "Equity", "Capital", "Assets"],
      answer: "finance",
      hint: "Think about money and business.",
    },
  ],
};

export function getDailyPuzzle(date: string, difficulty: Difficulty): Puzzle {
  const dayNumber = Math.floor(
    Date.parse(`${date}T12:00:00Z`) / 86400000
  );

  const dailyPuzzles = puzzles[difficulty];
  const puzzleIndex = ((dayNumber % dailyPuzzles.length) + dailyPuzzles.length) % dailyPuzzles.length;

  return dailyPuzzles[puzzleIndex];
}
