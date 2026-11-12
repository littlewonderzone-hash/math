import { useState } from "react";
import { Link } from "react-router-dom";

/** বিনামূল্যে নমুনা ধাঁধা — নিবন্ধন ছাড়াই করা যায়, উত্তর সাথে সাথে মিলিয়ে ব্যাখ্যা দেখায়।
 *  প্রতিটা ধাঁধায় প্যাটার্ন বা যুক্তি ধরে একটা গাণিতিক সমস্যার উত্তর বের করতে হয়। */
const PUZZLES = [
  {
    tag: "ধারা",
    title: "পরের সংখ্যাটা কী?",
    lines: ["২, ৬, ১২, ২০, ৩০, …"],
    ask: "পরের সংখ্যা",
    options: ["৩৮", "৪০", "৪২", "৪৮"],
    answer: "৪২",
    why: "সংখ্যাগুলো ১×২, ২×৩, ৩×৪, ৪×৫, ৫×৬ — তাই পরেরটা ৬×৭ = ৪২। (পার্থক্যগুলো ৪, ৬, ৮, ১০, ১২ — এভাবেও মেলে।)",
  },
  {
    tag: "যোগফল",
    title: "গাউসের কৌশল",
    lines: ["১ + ২ + ৩ + … + ৯৯ + ১০০"],
    ask: "যোগফল",
    options: ["৫০৫০", "৫১০০", "৪৯৫০", "৫০০০"],
    answer: "৫০৫০",
    why: "প্রথম আর শেষ সংখ্যা জোড়া করলে ১ + ১০০ = ১০১, ২ + ৯৯ = ১০১ … এমন ৫০টি জোড়া। তাই ৫০ × ১০১ = ৫০৫০।",
  },
  {
    tag: "জ্যামিতি",
    title: "কয়টা বর্গ?",
    lines: ["৩ × ৩ ঘরের একটি গ্রিডে সব মাপের মোট কয়টি বর্গ আছে?"],
    ask: "মোট বর্গ",
    options: ["৯", "১৪", "১৬", "১৮"],
    answer: "১৪",
    why: "১×১ মাপের বর্গ ৯টি, ২×২ মাপের ৪টি, ৩×৩ মাপের ১টি। মোট ৯ + ৪ + ১ = ১৪।",
  },
  {
    tag: "সংখ্যাতত্ত্ব",
    title: "এককের ঘরের অঙ্ক",
    lines: ["৭¹ = ৭, ৭² = ৪৯, ৭³ = ৩৪৩, ৭⁴ = ২৪০১, …", "৭¹⁰⁰ এর একক স্থানীয় অঙ্ক কত?"],
    ask: "একক স্থানের অঙ্ক",
    options: ["১", "৩", "৭", "৯"],
    answer: "১",
    why: "এককের অঙ্কগুলো ৭, ৯, ৩, ১ — প্রতি ৪টি ঘর পর পর পুনরাবৃত্তি হয়। ১০০ কে ৪ দিয়ে ভাগ করলে কোনো ভাগশেষ থাকে না, তাই ৭¹⁰⁰ এর একক অঙ্ক চক্রের শেষটা, অর্থাৎ ১।",
  },
  {
    tag: "গণনা",
    title: "করমর্দন",
    lines: ["৫ জন বন্ধু প্রত্যেকে প্রত্যেকের সাথে ঠিক একবার করে হাত মেলালো। মোট কয়টি করমর্দন হলো?"],
    ask: "মোট করমর্দন",
    options: ["৫", "১০", "১৫", "২০"],
    answer: "১০",
    why: "প্রত্যেকে বাকি ৪ জনের সাথে হাত মেলায় — ৫ × ৪ = ২০, কিন্তু প্রতিটা করমর্দন দুইবার গোনা হয়ে গেছে। তাই ২০ ÷ ২ = ১০ (অর্থাৎ C(৫, ২) = ১০)।",
  },
];

function PuzzleCard({ puzzle, index, picked, onPick }) {
  const solved = picked === puzzle.answer;
  return (
    <div className="border-2 border-[var(--color-ink)] bg-white p-5 shadow-[5px_5px_0_var(--color-marigold)]">
      <div className="flex items-baseline justify-between">
        <p className="mo-serif-bn text-lg font-extrabold text-[var(--color-ink)]">
          {String(index + 1).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d])}. {puzzle.title}
        </p>
        <span className="mo-serif text-xs italic text-[var(--color-ink)]/60">{puzzle.tag}</span>
      </div>

      <div className="mt-3">
        {puzzle.lines.map((line) => (
          <div key={line} className="border-b border-dashed border-[var(--color-paper-line)] py-2">
            <span className="mo-serif-bn text-lg leading-relaxed text-[var(--color-ink)]">{line}</span>
          </div>
        ))}
        <div className="flex items-baseline justify-between gap-3 py-2">
          <span className="mo-serif-bn font-bold text-[var(--color-redpen)]">{puzzle.ask}</span>
          <span className="mo-serif-bn font-bold text-[var(--color-redpen)]">= ?</span>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        {puzzle.options.map((opt) => {
          const chosen = picked === opt;
          return (
            <button
              key={opt}
              type="button"
              disabled={solved}
              onClick={() => onPick(opt)}
              className={`mo-serif-bn border-2 px-3.5 py-2 text-sm font-semibold transition ${
                chosen
                  ? opt === puzzle.answer
                    ? "border-[var(--color-greenpen)] bg-[var(--color-greenpen)] text-white"
                    : "border-[var(--color-redpen)] bg-[var(--color-redpen)] text-white"
                  : "border-[var(--color-ink)] text-[var(--color-ink)] hover:bg-[var(--color-ink)] hover:text-white disabled:opacity-50"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      <p className="mt-3 min-h-[2.5rem] text-sm leading-relaxed" aria-live="polite">
        {picked === null && <span className="text-[var(--color-text)]/60">প্যাটার্ন বা যুক্তি ধরে উত্তর বেছে নাও।</span>}
        {picked !== null && !solved && <span className="text-[var(--color-redpen)]">আবার ভাবো — ছোট ছোট ক্ষেত্রে হাতে-কলমে মিলিয়ে দেখো।</span>}
        {solved && <span className="text-[var(--color-greenpen)]">✓ ঠিক! {puzzle.why}</span>}
      </p>
    </div>
  );
}

export default function Puzzles() {
  const [picks, setPicks] = useState({});
  const solvedCount = PUZZLES.filter((p, i) => picks[i] === p.answer).length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="mo-serif text-sm italic text-[var(--color-marigold-dark)]">Free · নিবন্ধন ছাড়াই</p>
      <h1 className="mo-serif-bn mt-1 text-3xl font-extrabold text-[var(--color-ink)]">নমুনা ধাঁধা</h1>
      <p className="mt-2 max-w-xl text-sm text-[var(--color-text)]/75">
        গণিত অলিম্পিয়াডে শুধু সূত্র মুখস্থ করলে চলে না — প্যাটার্ন ধরে যুক্তি দিয়ে এগোতে হয়।
        নিচের ৫টা নমুনা ধাঁধা চেষ্টা করে দেখো।
      </p>

      <div className="mt-4 flex items-center gap-3">
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[var(--color-paper-line)]">
          <div className="h-full rounded-full bg-[var(--color-greenpen)] transition-all" style={{ width: `${(solvedCount / PUZZLES.length) * 100}%` }} />
        </div>
        <span className="text-sm font-bold text-[var(--color-ink)]">{solvedCount}/{PUZZLES.length}</span>
      </div>

      <div className="mt-6 space-y-6">
        {PUZZLES.map((p, i) => (
          <PuzzleCard key={p.title} puzzle={p} index={i} picked={picks[i] ?? null} onPick={(opt) => setPicks((s) => ({ ...s, [i]: opt }))} />
        ))}
      </div>

      {solvedCount === PUZZLES.length && (
        <div className="mt-8 border-2 border-[var(--color-ink)] bg-[var(--color-marigold)] p-5 text-center">
          <p className="mo-serif-bn text-xl font-extrabold text-[var(--color-ink-dark)]">সবগুলো মিলিয়ে ফেলেছ! 🎉</p>
          <p className="mt-1 text-sm text-[var(--color-ink-dark)]/80">কোর্সে এর চেয়েও কঠিন ও বিস্তারিত Model Test আছে — মেন্টর তোমার খাতা দেখে নম্বর দেবেন।</p>
          <Link to="/register" className="mt-4 inline-block rounded-xl bg-[var(--color-ink)] px-6 py-3 font-display font-bold text-white">
            কোর্সে নিবন্ধন করুন
          </Link>
        </div>
      )}
    </div>
  );
}
