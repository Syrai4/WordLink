
export type Difficulty = "Easy" | "Medium" | "Hard";

export interface Puzzle {
  words: string[];
  answer: string;
  hints: string[];
}

export const puzzles: Record<Difficulty, Puzzle[]> = {
  Easy: [
    {
      words: ["Crown", "Throne", "Castle", "Monarch"],
      answer: "king",
      hints: ["Think of someone who rules a kingdom."],
    },
    {
      words: ["Piano", "Guitar", "Drums", "Violin"],
      answer: "instruments",
      hints: ["These are all used to make music."],
    },
    {
      words: ["Winter", "Spring", "Summer", "Fall"],
      answer: "seasons",
      hints: ["There are four of these in a year."],
    },
  ],

  Medium: [
  {
    words: ["Mercury", "Venus", "Earth", "Mars"],
    answer: "planets",
    hints: [
      "These are part of our solar system.",
      "They orbit the Sun."
    ],
  },
  {
    words: ["Novel", "Poem", "Drama", "Essay"],
    answer: "writing",
    hints: [
      "These are different forms of written work.",
      "Authors and poets create these."
    ],
  },
  {
    words: ["Pixel", "Screen", "Keyboard", "Mouse"],
    answer: "computer",
    hints: [
      "Think about the device these are associated with.",
      "You might use one to browse the internet."
    ],
  },
],

  Hard: [
  {
    words: ["Draft", "Current", "Vent", "Gust"],
    answer: "air",
    hints: [
      "You cannot see it, but you can feel it move.",
      "It can flow through an open window.",
      "It is a mixture of gases surrounding Earth."
    ],
  },
  {
    words: ["Bass", "Treble", "Pitch", "Tone"],
    answer: "sound",
    hints: [
      "These describe qualities of what you hear.",
      "They are important elements of music.",
      "Your ears are responsible for detecting it."
    ],
  },
  {
    words: ["Margin", "Equity", "Capital", "Assets"],
    answer: "finance",
    hints: [
      "Think about money and business.",
      "These terms are often used in accounting.",
      "It involves managing money and investments."
    ],
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
