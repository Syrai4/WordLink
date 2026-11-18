import React, { useEffect, useState } from "react";
import type { CSSProperties, SyntheticEvent, ReactNode } from "react";
import { getDailyPuzzle, puzzles } from "./data/puzzles";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

type Difficulty = "Easy" | "Medium" | "Hard";
type IconName = "help" | "chart" | "flame" | "spark" | "share" | "close" | "arrow" | "lock";

const maxAttempts = 4;
const difficultyColors: Record<Difficulty, string> = {
  Easy: "#288c5b",
  Medium: "#d88726",
  Hard: "#d15c4c",
};

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.7 9a2.45 2.45 0 0 1 4.68 1c0 1.8-2.38 2.08-2.38 3.55" />
        <path d="M12 17h.01" />
      </>
    ),
    chart: (
      <>
        <path d="M5 20V10" />
        <path d="M12 20V4" />
        <path d="M19 20v-7" />
      </>
    ),
    flame: (
      <path d="M12 22c4.2 0 7-3.1 7-7.1 0-2.6-1.4-5.5-4.2-8.5.1 2.5-.7 4-1.9 4.7.2-4.1-2.3-7.2-4.5-9.1.1 4-3.4 6.7-3.4 11.8C5 18.5 7.9 22 12 22Z" />
    ),
    spark: (
      <>
        <path d="m12 2 1.25 5.2L18 9.5l-4.75 2.3L12 17l-1.25-5.2L6 9.5l4.75-2.3L12 2Z" />
        <path d="m19 15 .55 2.45L22 18l-2.45.55L19 21l-.55-2.45L16 18l2.45-.55L19 15Z" />
      </>
    ),
    share: (
      <>
        <circle cx="18" cy="5" r="2.5" />
        <circle cx="6" cy="12" r="2.5" />
        <circle cx="18" cy="19" r="2.5" />
        <path d="m8.2 10.8 7.6-4.5M8.2 13.2l7.6 4.5" />
      </>
    ),
    close: (
      <>
        <path d="m6 6 12 12M18 6 6 18" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14M14 7l5 5-5 5" />
      </>
    ),
    lock: (
      <>
        <rect x="5.5" y="10" width="13" height="10" rx="2" />
        <path d="M8.5 10V7a3.5 3.5 0 0 1 7 0v3M12 14v2" />
      </>
    ),
  };
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

interface Stats {
  played: number;
  wins: number;
  streak: number;
  best: number;
}

const defaultStats: Stats = { played: 12, wins: 10, streak: 3, best: 6 };

export default function App() {
  const [started, setStarted] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("Easy");
  const [guess, setGuess] = useState("");
  const [attempts, setAttempts] = useState<string[]>([]);
  const [hintVisible, setHintVisible] = useState(false);
  const [status, setStatus] = useState<"playing" | "won" | "lost">("playing");
  const [message, setMessage] = useState("");
  const [showStats, setShowStats] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState("Suggestion");
  const [feedbackEmail, setFeedbackEmail] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const [stats, setStats] = useState<Stats>(() => {
    try {
      return JSON.parse(localStorage.getItem("wordlink-stats") || "") || defaultStats;
    } catch {
      return defaultStats;
    }
  });
const [showHowToPlay, setShowHowToPlay] = useState(false);
const today = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());

const puzzle = getDailyPuzzle(today, difficulty);

const dateLabel = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
}).format(new Date());

const [year, month, day] = today.split("-").map(Number);

const puzzleNumber =
  Math.floor(
    (Date.UTC(year, month - 1, day) - Date.UTC(2026, 10, 18)) / 86400000
  ) + 1;

  useEffect(() => {
    setGuess("");
    setAttempts([]);
    setHintVisible(false);
    setStatus("playing");
    setMessage("");
  }, [difficulty]);

  useEffect(() => {
    localStorage.setItem("wordlink-stats", JSON.stringify(stats));
  }, [stats]);

  function submitGuess(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const clean = guess.trim().toLowerCase();
    if (!clean || status !== "playing") return;
    if (clean === puzzle.answer) {
      setStatus("won");
      setMessage("Brilliant connection!");
      setStats((current) => {
        const streak = current.streak + 1;
        return {
          played: current.played + 1,
          wins: current.wins + 1,
          streak,
          best: Math.max(current.best, streak),
        };
      });
    } else {
      const next = [...attempts, clean];
      setAttempts(next);
      setMessage(
        next.length >= maxAttempts
          ? `The link was “${puzzle.answer}”.`
          : "Not quite—look for another connection.",
      );
      if (next.length >= maxAttempts) {
        setStatus("lost");
        setStats((current) => ({ ...current, played: current.played + 1, streak: 0 }));
      }
    }
    setGuess("");
  }

  async function shareResult() {
    const blocks = Array.from({ length: maxAttempts }, (_, i) =>
      i < attempts.length ? "⬜" : i === attempts.length && status === "won" ? "🟩" : "▫️",
    ).join("");
    const text = `WordLink #${puzzleNumber} · ${difficulty}\n${blocks}\n${status === "won" ? `Solved in ${attempts.length + 1}/${maxAttempts}` : "Keep linking."}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setMessage("Result ready to share!");
    }
  }
  async function submitFeedback(event: SyntheticEvent<HTMLFormElement>) {
  event.preventDefault();

  if (!feedbackMessage.trim()) return;

  setFeedbackStatus("sending");

  try {
    const response = await fetch("https://formspree.io/f/xdeggpjv", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        category: feedbackType,
        ...(feedbackEmail.trim()
          ? { email: feedbackEmail.trim() }
          : {}),
      message: feedbackMessage.trim(),
      game: "WordLink",
}),
    });

    if (!response.ok) {
      throw new Error("Feedback submission failed");
    }

    setFeedbackStatus("success");
    setFeedbackMessage("");
    setFeedbackEmail("");
    setFeedbackType("Suggestion");
  } catch (error) {
    console.error("Feedback error:", error);
    setFeedbackStatus("error");
  }
}
  const solved = status === "won";
  const difficultyLocked = attempts.length > 0 || status !== "playing";

  if (!started) {
    return (
      <div className="welcome-shell">
        <header className="welcome-header">
          <a className="brand brand-light" href="#" aria-label="WordLink home">
            <span>WORD</span>
            <span className="brand-dot">•</span>
            <span>LINK</span>
          </a>
        </header>

        <main className="welcome-main">
          <div className="welcome-copy">
            <h1>Find the link.</h1>
            <p>Four words. One connection.</p>
            <button className="start-button" onClick={() => setStarted(true)}>
              Start
              <Icon name="arrow" size={20} />
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#" aria-label="WordLink home">
          <span>WORD</span>
          <span className="brand-dot">•</span>
          <span>LINK</span>
        </a>
        <nav className="header-actions" aria-label="Utility navigation">
          <button
            className="icon-button"
            aria-label="How to play"
            onClick={() => setShowHowToPlay(true)}
          >
            <Icon name="help" />
          </button>
          <button className="stats-button" onClick={() => setShowStats(true)}>
            <Icon name="chart" />
            <span>Stats</span>
          </button>
          <div className="streak-pill">
            <Icon name="flame" size={18} />
            <strong>{stats.streak}</strong>
            <span>day streak</span>
          </div>
        </nav>
      </header>

      <main>
        <section className="game-card">
          <div className="game-meta">
            <div>
              <span className="puzzle-id">Puzzle #{puzzleNumber}</span>
              <span className="meta-separator">/</span>
              <span>{dateLabel}</span>
            </div>
            <div className="attempt-counter">
              <span>Attempts</span>
              <div className="attempt-dots">
                {Array.from({ length: maxAttempts }, (_, i) => (
                  <i
                    key={i}
                    className={
                      i < attempts.length
                        ? "used"
                        : solved && i === attempts.length
                          ? "success"
                          : ""
                    }
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="difficulty-wrap">
            <span className="field-label">
              {difficultyLocked ? "Level locked for this puzzle" : "Choose your level"}
            </span>
            <div className="difficulty-tabs">
              {(Object.keys(puzzles) as Difficulty[]).map((item) => (
                <button
                  key={item}
                  className={difficulty === item ? "active" : ""}
                  onClick={() => setDifficulty(item)}
                  disabled={difficultyLocked}
                  style={{ "--level": difficultyColors[item] } as CSSProperties}
                >
                  <span className="level-dot" />
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="word-grid">
            {puzzle.words.map((word, index) => (
              <div className="word-tile" key={word}>
                <span>0{index + 1}</span>
                <strong>{word}</strong>
              </div>
            ))}
          </div>

          <div className="answer-area">
            {hintVisible && (
              <div className="hint-callout">
                <Icon name="spark" size={17} />
                {puzzle.hint}
              </div>
            )}
            {message && <div className={`game-message ${solved ? "win" : ""}`}>{message}</div>}
            <form onSubmit={submitGuess}>
              <label htmlFor="answer">What connects these words?</label>
              <div className="input-row">
                <input
                  id="answer"
                  value={guess}
                  disabled={status !== "playing"}
                  onChange={(e) => setGuess(e.target.value)}
                  placeholder="Type your answer..."
                  autoComplete="off"
                />
                <button
                  className="submit-button"
                  type="submit"
                  disabled={!guess.trim() || status !== "playing"}
                >
                  {solved ? "Solved" : "Submit"}
                  <Icon name="arrow" size={18} />
                </button>
              </div>
            </form>
            <div className="game-tools">
              <button
                onClick={() => setHintVisible(true)}
                disabled={hintVisible || status !== "playing"}
              >
                <Icon name="spark" size={17} />
                {hintVisible ? "Hint revealed" : "Need a hint?"}
              </button>
            </div>
            {status !== "playing" && (
              <button className="share-button" onClick={shareResult}>
                <Icon name="share" size={18} />
                {copied ? "Copied to clipboard" : "Share result"}
              </button>
            )}
          </div>
        </section>

        <div className="bottom-note">
          <span>New puzzle every day at midnight</span>
          <i />
          <span>Come back tomorrow to keep your streak alive</span>
        </div>
      </main>

      <footer>
        <span>© 2027 WordLink</span>
        <div>
          <button onClick={() => setShowHowToPlay(true)}>How to play</button>
          <button onClick={() => setShowPrivacy(true)}>Privacy</button>
          <button onClick={() => {
            setFeedbackStatus("idle");
            setShowFeedback(true);
         }}>
           Feedback
         </button>
         </div>
      </footer>

      {showStats && (
        <div className="modal-backdrop" onMouseDown={() => setShowStats(false)}>
          <section
            className="modal"
            onMouseDown={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="stats-title"
          >
            <button
              className="modal-close"
              onClick={() => setShowStats(false)}
              aria-label="Close stats"
            >
              <Icon name="close" />
            </button>
            <div className="modal-icon">
              <Icon name="chart" size={26} />
            </div>
            <span className="eyebrow">Your progress</span>
            <h2 id="stats-title">Statistics</h2>
            <div className="stats-grid">
              <div>
                <strong>{stats.played}</strong>
                <span>Played</span>
              </div>
              <div>
                <strong>{stats.played ? Math.round((stats.wins / stats.played) * 100) : 0}%</strong>
                <span>Win rate</span>
              </div>
              <div>
                <strong>{stats.streak}</strong>
                <span>Streak</span>
              </div>
              <div>
                <strong>{stats.best}</strong>
                <span>Best</span>
              </div>
            </div>
            <p>Keep linking words each day to grow your streak.</p>
            <button className="modal-action" onClick={() => setShowStats(false)}>
              Back to puzzle
            </button>
          </section>
        </div>
      )}
      {showHowToPlay && (
        <div 
            className="modal-backdrop"
          onMouseDown={() => setShowHowToPlay(false)}
        >
          <section
            className="modal how-to-play-modal"
            onMouseDown={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="how-to-play-title"
          >
            <button
              className="modal-close"
              onClick={() => setShowHowToPlay(false)}
              aria-label="Close instructions"
            >
              <Icon name="close" />
            </button>

            <div className="modal-icon">
              <Icon name="help" size={26} />
            </div>

            <span className="eyebrow">Learn the game</span>
            <h2 id="how-to-play-title">How to Play</h2>

            
            <div className="how-to-play-content">
             <h3>1. Choose your difficulty</h3>
              <p>
              Choose between Easy, Medium, or Hard depending
              on how much of a challenge you want.
              </p>

              <h3>2. Find your connection</h3>
              <p>
               You'll be given four words. Think about what
               they have in common and figure out the one word
               that connects them all. Enter your guess.
              </p>

               <h3>3. Use your hints</h3>
               <p>
              Stuck? Reveal a hint to help you uncover
              the hidden connection.
              </p>

              <h3>4. Solve the puzzle</h3>
              <p>
              You have four attempts to find the correct
              connecting word. Can you solve it?
              </p>
              </div>

            <button
              className="modal-action"
              onClick={() => setShowHowToPlay(false)}
            >
              Got it! Let's Play
            </button>
          </section>
        </div>
      )}
      
      {showFeedback && (
        <div
          className="modal-backdrop"
          onMouseDown={() => setShowFeedback(false)}
        >
          <section
            className="modal"
            onMouseDown={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-title"
          >
            <button
              className="modal-close"
              onClick={() => setShowFeedback(false)}
              aria-label="Close feedback"
            >
              <Icon name="close" />
            </button>

            <div className="modal-icon">
              <Icon name="share" size={26} />
            </div>

            <span className="eyebrow">Your voice matters</span>
            <h2 id="feedback-title">Send Feedback</h2>

            {feedbackStatus === "success" ? (
              <div className="feedback-success">
                <h3>Thank you!</h3>
                <p>
                  Your feedback has been received.
                  We appreciate you helping us improve WordLink!
                </p>
                <button
                  className="modal-action"
                  onClick={() => setShowFeedback(false)}
                >
                  Back to puzzle
                </button>
              </div>
            ) : (
              <form onSubmit={submitFeedback} className="feedback-form">

                <label htmlFor="feedback-type">
                  What is your feedback about?
                </label>
                <select
                  id="feedback-type"
                  value={feedbackType}
                  onChange={(e) => setFeedbackType(e.target.value)}
                >
                  <option>Suggestion</option>
                  <option>Bug Report</option>
                  <option>General Feedback</option>
                </select>

                <label htmlFor="feedback-email">
                  Your email (optional)
                </label>
                <input
                  id="feedback-email"
                  type="email"
                  placeholder="Enter your email"
                  value={feedbackEmail}
                  onChange={(e) => setFeedbackEmail(e.target.value)}
                />

                <label htmlFor="feedback-message">
                  Your message
                </label>
                <textarea
                  id="feedback-message"
                  placeholder="Tell us what you think..."
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  required
                  rows={5}
                />

                {feedbackStatus === "error" && (
                  <p role="alert">
                    Something went wrong. Please try again.
                  </p>
                )}

                <button
                  className="modal-action"
                  type="submit"
                  disabled={
                    feedbackStatus === "sending" ||
                    !feedbackMessage.trim()
                  }
                >
                  {feedbackStatus === "sending"
                    ? "Sending..."
                    : "Submit Feedback"}
                </button>
              </form>
            )}
          </section>
        </div>
      )}
      
{showPrivacy && (
  <div
    className="modal-backdrop"
    onMouseDown={() => setShowPrivacy(false)}
  >
    <section
      className="modal"
      onMouseDown={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-title"
    >
      <button
        className="modal-close"
        onClick={() => setShowPrivacy(false)}
        aria-label="Close privacy policy"
      >
        <Icon name="close" />
      </button>

      <div className="modal-icon">
        <Icon name="lock" size={26} />
      </div>

      <span className="eyebrow">Your privacy matters</span>
      <h2 id="privacy-title">Privacy Policy</h2>

      <div className="privacy-content">
        <p><strong>Last updated: November 17, 2026</strong></p>

        <h3>1. Information We Collect</h3>
        <p>
          WordLink does not require players to create an account.
          If you submit feedback, we may receive your message and
          any email address you choose to provide.
        </p>

        <h3>2. Game Statistics</h3>
        <p>
          Your game statistics and preferences may be stored
          locally in your browser using local storage.
        </p>

        <h3>3. Feedback Submissions</h3>
        <p>
          Feedback is processed through Formspree so that we
          can receive and review suggestions, bug reports,
          and other comments.
        </p>

        <h3>4. Third-Party Services</h3>
        <p>
          WordLink uses Formspree to process feedback submissions.
          Its handling of submitted information is subject to
          its own privacy policy.
        </p>

        <h3>5. Data Sharing</h3>
        <p>
          We do not sell personal information. Information
          submitted through feedback may be processed by the
          third-party service used to deliver it.
        </p>

        <h3>6. Contact</h3>
        <p>
          If you have questions about this Privacy Policy,
          please contact us through the WordLink feedback form.
        </p>
      </div>

      <button
        className="modal-action"
        onClick={() => setShowPrivacy(false)}
      >
        Close
      </button>
    </section>
  </div>
)}

    </div>
  );
}
