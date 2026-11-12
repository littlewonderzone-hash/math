import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { toDirectImageUrl } from "../lib/image";
import CountdownBanner from "../components/CountdownBanner";

/* ---------- বাংলা অঙ্ক ও সংখ্যার চার্ট ---------- */
const BN_DIGITS = "০১২৩৪৫৬৭৮৯";
const bn = (n) => String(n).replace(/\d/g, (d) => BN_DIGITS[d]);

function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}

/* ১ থেকে ৮০ — মৌলিক সংখ্যাগুলো হাইলাইট (শুধুই সাজসজ্জা + ছুঁয়ে দেখার খেলা) */
const NUMBERS = Array.from({ length: 80 }, (_, i) => i + 1);
const PRIMES = NUMBERS.filter(isPrime);

function Describe({ n }) {
  if (n === 1) return <span>{bn(1)} — মৌলিকও নয়, যৌগিকও নয়</span>;
  const factors = [];
  let m = n;
  for (let p = 2; p * p <= m; p++) {
    let e = 0;
    while (m % p === 0) {
      m /= p;
      e++;
    }
    if (e) factors.push([p, e]);
  }
  if (m > 1) factors.push([m, 1]);
  if (factors.length === 1 && factors[0][1] === 1) {
    return (
      <span>
        <b>{bn(n)}</b> একটি মৌলিক সংখ্যা — ১ আর নিজেকে ছাড়া কিছুতেই নিঃশেষে ভাগ হয় না
      </span>
    );
  }
  return (
    <span>
      <b>{bn(n)}</b> ={" "}
      {factors.map(([p, e], i) => (
        <span key={p}>
          {i > 0 && " × "}
          {bn(p)}
          {e > 1 && <sup>{bn(e)}</sup>}
        </span>
      ))}
    </span>
  );
}

function NumberChart({ faded = false }) {
  const [active, setActive] = useState(null);
  return (
    <div>
      <div className={`mo-chart ${faded ? "mo-chart-faded" : ""}`} aria-hidden="true">
        {NUMBERS.map((n) => {
          const pi = PRIMES.indexOf(n);
          const hit = pi !== -1;
          return (
            <span
              key={n}
              className={`mo-cell ${hit ? "mo-cell-hit" : ""} ${active === n ? "mo-cell-on" : ""}`}
              style={hit ? { "--i": pi } : undefined}
              onMouseEnter={faded ? undefined : () => setActive(n)}
              onClick={faded ? undefined : () => setActive(n)}
            >
              {bn(n)}
            </span>
          );
        })}
      </div>
      {!faded && (
        <p className="mo-readout" aria-live="polite">
          {active === null ? "যেকোনো ঘরে ছুঁয়ে দেখো — সংখ্যাটার উৎপাদক কী?" : <Describe n={active} />}
        </p>
      )}
    </div>
  );
}

const FORMULAS = [
  "a² + b² = c²",
  "e^(iπ) + 1 = 0",
  "1 + 2 + 3 + … + n = n(n+1)/2",
  "(a + b)² = a² + 2ab + b²",
  "sin²θ + cos²θ = 1",
  "φ = (1 + √5) / 2",
  "n! = n × (n − 1)!",
  "C(n, r) = n! / r!(n − r)!",
  "∫ x dx = x²/2 + C",
  "π ≈ 3.14159…",
];

const FEATURES = [
  { glyph: "∑", color: "var(--color-redpen)", title: "Model Test সিরিজ", desc: "Model Test-01, 02, 03… নিজের ইচ্ছামতো বেছে নিয়ে ধাপে ধাপে দাও, যতবার খুশি অনুশীলন।" },
  { glyph: "π", color: "var(--color-bluepen)", title: "আসল পরীক্ষার অনুরূপ", desc: "প্রশ্নের মান ও ধরন হুবহু আসল পরীক্ষার অনুরূপ।" },
  { glyph: "∫", color: "var(--color-marigold-dark)", title: "লাইভ পরীক্ষা", desc: "নির্দিষ্ট সময়ে সবার সাথে প্রতিযোগিতামূলক পরীক্ষা ও র‍্যাঙ্কিং।" },
  { glyph: "√", color: "var(--color-greenpen)", title: "অভিজ্ঞ মেন্টর দ্বারা মূল্যায়ন", desc: "লিখিত খাতা সরাসরি অভিজ্ঞ মেন্টরদের দ্বারা মূল্যায়ন।" },
  { glyph: "∞", color: "var(--color-ink)", title: "সারা দেশের মেরিট", desc: "সারা দেশের শিক্ষার্থীদের সাথে নিজের অবস্থান যাচাই।" },
  { glyph: "∠", color: "var(--color-redpen)", title: "বিস্তারিত মূল্যায়ন", desc: "প্রতিটা প্রশ্নে আলাদা নম্বর, খাতার ওপর মেন্টরের দাগ ও মন্তব্য।" },
];

const STEPS = [
  ["নিবন্ধন", "ফর্ম পূরণ করে বিকাশে পেমেন্ট"],
  ["যাচাই", "অ্যাডমিন পেমেন্ট দেখে কনফার্ম করেন"],
  ["লগইন", "ইমেইল ও পাসওয়ার্ডে পোর্টালে ঢুকুন"],
  ["পরীক্ষা", "Model Test বা লাইভ — খাতায় লিখে ছবি জমা"],
];

/* ছোট্ট ধাঁধা — ছোট ক্ষেত্রে প্যাটার্ন দেখে বড় উত্তর ধরা (অলিম্পিয়াডের ধরনের নমুনা) */
const PUZZLE_OPTIONS = ["৯০", "১০০", "১১০", "১২১"];
const PUZZLE_ANSWER = "১০০";

function Puzzle() {
  const [picked, setPicked] = useState(null);
  const solved = picked === PUZZLE_ANSWER;

  return (
    <div>
      <div className="mo-pair">
        <span className="mo-serif text-xl font-bold italic">১</span>
        <span className="mo-serif text-lg">= ১ = ১²</span>
      </div>
      <div className="mo-pair">
        <span className="mo-serif text-xl font-bold italic">১ + ৩</span>
        <span className="mo-serif text-lg">= ৪ = ২²</span>
      </div>
      <div className="mo-pair">
        <span className="mo-serif text-xl font-bold italic">১ + ৩ + ৫</span>
        <span className="mo-serif text-lg">= ৯ = ৩²</span>
      </div>
      <div className="mo-pair">
        <span className="mo-serif text-xl font-bold italic text-[var(--color-marigold)]">১ + ৩ + ৫ + … + ১৯</span>
        <span className="mo-serif text-lg text-[var(--color-marigold)]">= ?</span>
      </div>
      <p className="mo-serif-bn -mt-1 text-xs text-[var(--color-paper)]/60">(প্রথম ১০টি বিজোড় সংখ্যার যোগফল)</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {PUZZLE_OPTIONS.map((opt) => (
          <button
            key={opt}
            type="button"
            disabled={solved}
            onClick={() => setPicked(opt)}
            className={`mo-opt mo-serif-bn ${picked === opt ? (opt === PUZZLE_ANSWER ? "mo-opt-right" : "mo-opt-wrong") : ""}`}
          >
            {opt}
          </button>
        ))}
      </div>
      <p className="mt-3 min-h-[3rem] text-sm leading-relaxed text-[var(--color-paper)]/85" aria-live="polite">
        {picked === null && "প্যাটার্নটা ধরতে পারলে বলো — যোগফল কত?"}
        {picked !== null && !solved && "আবার ভাবো — কয়টা বিজোড় সংখ্যা যোগ হলো, আর যোগফলটা তার কী?"}
        {solved && "ঠিক! প্রথম n টি বিজোড় সংখ্যার যোগফল n²। তাই ১০টির যোগফল ১০² = ১০০। অলিম্পিয়াডে এভাবেই ছোট ক্ষেত্রে প্যাটার্ন ধরে বড় উত্তর বের করতে হয়।"}
      </p>
    </div>
  );
}

export default function Home() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getSettings()
      .then((res) => setSettings(res.data || {}))
      .catch(() => setSettings({}))
      .finally(() => setLoading(false));
  }, []);

  const hasImage = !!settings?.courseImageUrl;
  const priceLabel = loading ? "মূল্য লোড হচ্ছে…" : settings?.price ? `৳${settings.price} টাকায়` : "ফ্রি";

  return (
    <div>
      {settings && (
        <CountdownBanner
          price={settings.price}
          deadline={settings.discountDeadline}
          maintenanceMode={settings.maintenanceMode}
        />
      )}

      {/* ===== হিরো ===== */}
      <section className="mo-hero">
        <span className="mo-watermark" aria-hidden="true">π</span>
        <div className="relative mx-auto grid max-w-5xl items-center gap-12 px-4 pb-20 pt-12 md:grid-cols-[1fr_1fr] md:pb-28 md:pt-20">
          <div>
            <p className="mo-serif text-sm text-[var(--color-paper)]/75">
              <span className="font-bold italic text-white">Mathematics</span>{" "}
              <span className="italic">/ˌmæθˈmætɪks/</span> · — সংখ্যা, আকার ও যুক্তির বিজ্ঞান
            </p>
            <h1 className="mo-serif-bn mt-3 text-5xl font-extrabold leading-[1.25] text-white sm:text-6xl md:text-7xl">
              গণিত
              <br />
              অলিম্পিয়াড
            </h1>
            <p className="mo-serif-bn mt-4 text-2xl font-extrabold leading-snug text-[var(--color-marigold)] md:text-3xl">
              প্রস্তুতি কোর্স
            </p>
            <p className="mt-1 font-display text-base font-semibold text-[var(--color-paper)]/80">অগ্রদূত উপস্থাপিত</p>
            <p className="mt-5 max-w-md text-base leading-relaxed text-[var(--color-paper)]/90 md:text-lg">
              তৃতীয় থেকে দ্বাদশ শ্রেণির শিক্ষার্থীদের জন্য গণিত অলিম্পিয়াডের পরিপূর্ণ প্রস্তুতি। লিখিত
              Model Test সিরিজ, লাইভ পরীক্ষা, বিস্তারিত মূল্যায়ন ও র‍্যাঙ্কিং — সবকিছু এক জায়গায়।
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="rounded-xl bg-[var(--color-marigold)] px-7 py-3.5 font-display text-base font-bold text-[var(--color-ink-dark)] shadow-lg shadow-black/30 transition hover:brightness-110 active:scale-95"
              >
                এখনই নিবন্ধন করুন
              </Link>
              <Link
                to="/status"
                className="rounded-xl border-2 border-white/70 px-7 py-3.5 font-display text-base font-bold text-white transition hover:bg-white hover:text-[var(--color-ink)] active:scale-95"
              >
                নিবন্ধন স্ট্যাটাস দেখুন
              </Link>
            </div>
          </div>

          <figure className="relative">
            <span className="mo-bubble hidden md:block" style={{ top: "-1.6rem", left: "-1.2rem", "--d": "0s" }}>π ≈ ৩.১৪১৬</span>
            <span className="mo-bubble mo-bubble-alt hidden md:block" style={{ top: "2.2rem", right: "-1.4rem", "--d": "1.2s" }}>√২</span>
            <span className="mo-bubble hidden md:block" style={{ bottom: "5.2rem", left: "-1.6rem", "--d": "2.4s" }}>x² + y² = r²</span>
            <span className="mo-bubble mo-bubble-alt hidden md:block" style={{ bottom: "-1.2rem", right: "1.4rem", "--d": "0.6s" }}>∞</span>

            {hasImage ? (
              <div className="relative">
                <div className="absolute -right-3 -top-3 w-full md:-right-5 md:-top-5">
                  <NumberChart faded />
                </div>
                <div className="relative aspect-[4/3] w-full overflow-hidden border-2 border-white/80 bg-[var(--color-ink)] shadow-2xl">
                  <img
                    src={toDirectImageUrl(settings.courseImageUrl)}
                    alt="গণিত অলিম্পিয়াড কোর্স"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              </div>
            ) : (
              <NumberChart />
            )}
            <figcaption className="mo-serif mt-4 flex items-center justify-between gap-3 text-xs italic text-[var(--color-paper)]/75">
              <span>চিত্র ১: ১ থেকে ৮০ — হলুদ ঘরগুলো মৌলিক সংখ্যা</span>
              <span className="mo-serif-bn rotate-[-3deg] rounded-sm bg-white px-3 py-1.5 text-sm font-bold not-italic text-[var(--color-ink)] shadow-lg">
                {priceLabel}
              </span>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ===== সূত্রের ফিতা ===== */}
      <div className="mo-marquee" aria-hidden="true">
        <div className="mo-marquee-track">
          {[...FORMULAS, ...FORMULAS].map((w, i) => (
            <span key={i}>{w}</span>
          ))}
        </div>
      </div>

      {/* ===== কোর্সে যা যা থাকছে ===== */}
      <section className="mo-graph">
        <div className="mx-auto max-w-5xl px-4 py-14">
          <h2 className="mo-serif-bn text-3xl font-extrabold text-[var(--color-ink)]">কোর্সে যা যা থাকছে</h2>
          <p className="mt-1 text-sm text-[var(--color-text)]/70">প্রতিটা সুবিধার পাশে একটা করে গাণিতিক চিহ্ন — কারণ এটা গণিতের কোর্স।</p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="mo-feature" style={{ "--accent": f.color }}>
                <span className="mo-feature-bg" aria-hidden="true">{f.glyph}</span>
                <span className="mo-glyph" aria-hidden="true">{f.glyph}</span>
                <h3 className="mo-serif-bn relative mt-4 text-lg font-bold text-[var(--color-ink)]">{f.title}</h3>
                <p className="relative mt-1.5 text-sm leading-relaxed text-[var(--color-text)]/80">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ছোট্ট ধাঁধা ===== */}
      <section className="mo-puzzle">
        <div className="mx-auto grid max-w-5xl items-center gap-10 px-4 py-14 md:grid-cols-2">
          <div>
            <p className="mo-serif text-sm italic text-[var(--color-marigold)]">Try it · একটা মিনিট-ধাঁধা</p>
            <h2 className="mo-serif-bn mt-2 text-3xl font-extrabold leading-snug">
              ছোট ক্ষেত্রে দেখো, বড় উত্তর ধরো
            </h2>
            <p className="mt-3 max-w-md text-[var(--color-paper)]/85">
              গণিত অলিম্পিয়াডে বড় সূত্র মুখস্থ নয়, প্যাটার্ন ধরে যুক্তি সাজানোই আসল। এই ধাঁধাটা একবার
              চেষ্টা করে দেখো।
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/puzzles"
                className="inline-block rounded-xl bg-[var(--color-marigold)] px-6 py-3 font-display font-bold text-[var(--color-ink-dark)] transition hover:brightness-110 active:scale-95"
              >
                আরও ৫টা ধাঁধা করে দেখো
              </Link>
              <Link
                to="/register"
                className="inline-block rounded-xl border-2 border-white/70 px-6 py-3 font-display font-bold text-white transition hover:bg-white hover:text-[var(--color-ink)] active:scale-95"
              >
                কোর্সে নিবন্ধন
              </Link>
            </div>
          </div>
          <div className="border border-white/25 bg-white/5 p-5">
            <p className="mo-serif mb-1 text-xs italic text-[var(--color-paper)]/60">প্যাটার্ন খোঁজো · বিজোড় সংখ্যার যোগ</p>
            <Puzzle />
          </div>
        </div>
      </section>

      {/* ===== অংশগ্রহণের ধাপ ===== */}
      <section className="mx-auto max-w-5xl px-4 py-14">
        <h2 className="mo-serif-bn text-3xl font-extrabold text-[var(--color-ink)]">কীভাবে অংশ নেবেন</h2>
        <ol className="mo-steps mt-8">
          {STEPS.map(([title, gloss], i) => (
            <li key={title} className="mo-step">
              <span className="mo-step-num">{bn(i + 1)}</span>
              <p className="mo-serif-bn text-lg font-bold text-[var(--color-ink)]">{title}</p>
              <p className="mt-1 text-sm leading-relaxed text-[var(--color-text)]/75">{gloss}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ===== শেষ ডাক ===== */}
      <section className="bg-[var(--color-marigold)]">
        <div className="mx-auto flex max-w-5xl flex-col items-start gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mo-serif-bn text-2xl font-extrabold text-[var(--color-ink-dark)]">লিখিত পরীক্ষা ও লাইভ পরীক্ষা — সবই চালু আছে</p>
            <p className="mt-1 text-sm text-[var(--color-ink-dark)]/80">নিবন্ধিত হলে স্টুডেন্ট লগইন করে পোর্টাল থেকে অংশ নিন।</p>
          </div>
          <Link
            to="/student/login"
            className="shrink-0 rounded-xl bg-[var(--color-ink)] px-7 py-3.5 font-display text-base font-bold text-white transition hover:brightness-110 active:scale-95"
          >
            স্টুডেন্ট লগইন
          </Link>
        </div>
      </section>
    </div>
  );
}
