import { useEffect, useLayoutEffect, useRef, useState } from "react";

/** লগইন করা স্টুডেন্টদের জন্য ভাসমান যোগাযোগ বাটন — চাপলে দুইজনের WhatsApp নম্বর দেখায়,
 *  কোনোটায় চাপলেই সরাসরি ওই নম্বরের WhatsApp ইনবক্স খোলে (wa.me লিংক)।
 *  ডিফল্ট জায়গা: নিচের ডান কোণ। বাটনটা টেনে (ড্র্যাগ করে) পর্দার যেকোনো জায়গায় সরানো যায়;
 *  নতুন জায়গাটা ব্রাউজারে মনে থাকে, আর পর্দার মাপ/অরিয়েন্টেশন বদলালেও বাটন পর্দার ভেতরেই থাকে। */
const CONTACTS = [
  { name: "Md. Musfiqul Alom", display: "+880 1872-821870", wa: "8801872821870" },
  { name: "Rion Khan", display: "+880 1759-609395", wa: "8801759609395" },
];

function WhatsAppIcon({ className = "h-7 w-7" }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden="true">
      <path d="M16.04 3C9.4 3 4 8.4 4 15.03c0 2.12.55 4.19 1.6 6.02L4 28l7.1-1.86a12 12 0 0 0 4.94 1.06h.01C22.68 27.2 28 21.8 28 15.17A12.1 12.1 0 0 0 16.04 3Zm0 21.9h-.01c-1.78 0-3.52-.48-5.04-1.38l-.36-.21-4.21 1.1 1.12-4.1-.24-.38a9.9 9.9 0 0 1-1.52-5.3c0-5.47 4.46-9.92 9.95-9.92 2.65 0 5.14 1.03 7.01 2.9a9.84 9.84 0 0 1 2.9 7.02c0 5.47-4.46 9.92-9.9 9.92Zm5.44-7.43c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35Z" />
    </svg>
  );
}

const POS_KEY = "matholy_wa_pos";
const MARGIN = 8; // পর্দার কিনারা থেকে ন্যূনতম দূরত্ব (px)
const DRAG_THRESHOLD = 6; // এর কম নড়লে সেটা "চাপ", টান নয়
const PANEL_W = 280; // 17.5rem

const clamp01 = (v) => Math.min(1, Math.max(0, v));

function loadRatio() {
  try {
    const p = JSON.parse(localStorage.getItem(POS_KEY));
    if (p && Number.isFinite(p.fx) && Number.isFinite(p.fy)) return { fx: clamp01(p.fx), fy: clamp01(p.fy) };
  } catch {
    /* ignore */
  }
  return null;
}

function saveRatio(r) {
  try {
    if (r) localStorage.setItem(POS_KEY, JSON.stringify(r));
    else localStorage.removeItem(POS_KEY);
  } catch {
    /* ignore */
  }
}

/* জায়গাটা পর্দার মাপের অনুপাত (০–১) হিসেবে রাখা হয়, তাই রিসাইজ বা ফোন ঘোরালেও বাটন পর্দার ভেতরে থাকে */
function toRatio(left, top, size, vp) {
  const rx = Math.max(1, vp.w - size.w - 2 * MARGIN);
  const ry = Math.max(1, vp.h - size.h - 2 * MARGIN);
  return { fx: clamp01((left - MARGIN) / rx), fy: clamp01((top - MARGIN) / ry) };
}

function fromRatio(r, size, vp) {
  const rx = Math.max(0, vp.w - size.w - 2 * MARGIN);
  const ry = Math.max(0, vp.h - size.h - 2 * MARGIN);
  return { left: MARGIN + r.fx * rx, top: MARGIN + r.fy * ry };
}

export default function FloatingContact({ studentName = "" }) {
  const [open, setOpen] = useState(false);
  const [ratio, setRatio] = useState(loadRatio); // null = ডিফল্ট (নিচের ডান কোণ)
  const [vp, setVp] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));
  const [size, setSize] = useState({ w: 56, h: 48 });
  const [dragging, setDragging] = useState(false);
  const [placement, setPlacement] = useState({ up: true, left: 0, width: PANEL_W });

  const boxRef = useRef(null);
  const btnRef = useRef(null);
  const drag = useRef(null);
  const latestRatio = useRef(ratio);
  const justDragged = useRef(false);

  useLayoutEffect(() => {
    const measure = () => {
      if (btnRef.current) {
        const r = btnRef.current.getBoundingClientRect();
        setSize({ w: r.width, h: r.height });
      }
      setVp({ w: window.innerWidth, h: window.innerHeight });
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => boxRef.current && !boxRef.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pos = ratio ? fromRatio(ratio, size, vp) : null;

  function onPointerDown(e) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const r = btnRef.current.getBoundingClientRect();
    drag.current = { id: e.pointerId, sx: e.clientX, sy: e.clientY, left: r.left, top: r.top, moved: false };
    btnRef.current.setPointerCapture?.(e.pointerId);
  }

  function onPointerMove(e) {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.sx;
    const dy = e.clientY - d.sy;
    if (!d.moved) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      d.moved = true;
      setDragging(true);
      setOpen(false);
    }
    const next = toRatio(d.left + dx, d.top + dy, size, { w: window.innerWidth, h: window.innerHeight });
    latestRatio.current = next;
    setRatio(next);
  }

  function endDrag(e) {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    btnRef.current?.releasePointerCapture?.(e.pointerId);
    if (d.moved) {
      setDragging(false);
      saveRatio(latestRatio.current);
      // টানার শেষে আসা "click" ইভেন্ট যেন প্যানেল না খোলে
      justDragged.current = true;
      setTimeout(() => {
        justDragged.current = false;
      }, 60);
    }
  }

  function toggle() {
    if (justDragged.current) return;
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      const width = Math.min(PANEL_W, window.innerWidth - 2 * MARGIN);
      const desired = Math.min(Math.max(r.right - width, MARGIN), window.innerWidth - width - MARGIN);
      setPlacement({ up: r.top + r.height / 2 > window.innerHeight / 2, left: desired - r.left, width });
    }
    setOpen((o) => !o);
  }

  function resetPosition() {
    latestRatio.current = null;
    setRatio(null);
    saveRatio(null);
    setOpen(false);
  }

  const text = encodeURIComponent(
    `আসসালামু আলাইকুম, আমি ${studentName ? studentName + " — " : ""}গণিত অলিম্পিয়াড প্রস্তুতি কোর্সের স্টুডেন্ট। একটা বিষয়ে জানার ছিল।`
  );

  const boxStyle = pos
    ? { left: pos.left, top: pos.top }
    : { right: "1rem", bottom: "max(1.25rem, env(safe-area-inset-bottom))" };

  return (
    <div ref={boxRef} className="fixed z-50 print:hidden" style={boxStyle}>
      {open && (
        <div
          className={`absolute overflow-hidden rounded-2xl border border-[var(--color-paper-line)] bg-white shadow-2xl ${placement.up ? "bottom-full mb-3" : "top-full mt-3"}`}
          style={{ left: placement.left, width: placement.width }}
        >
          <div className="flex items-center gap-2 bg-[#128c7e] px-4 py-3 text-white">
            <WhatsAppIcon className="h-5 w-5" />
            <p className="font-display text-sm font-bold">WhatsApp-এ যোগাযোগ করুন</p>
          </div>
          <div className="divide-y divide-[var(--color-paper-line)]">
            {CONTACTS.map((c) => (
              <a
                key={c.wa}
                href={`https://wa.me/${c.wa}?text=${text}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 transition hover:bg-[#25d366]/10"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#25d366]/15 font-display font-bold text-[#128c7e]">
                  {c.name.replace("Md. ", "").charAt(0)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-display text-sm font-bold text-[var(--color-ink)]">{c.name}</span>
                  <span className="block text-xs tabular-nums text-[var(--color-text)]/65">{c.display}</span>
                </span>
                <span className="text-[#128c7e]" aria-hidden="true">
                  <WhatsAppIcon className="h-5 w-5" />
                </span>
              </a>
            ))}
          </div>
          <div className="flex items-center justify-between gap-2 bg-[var(--color-paper)] px-4 py-2 text-[11px] text-[var(--color-text)]/60">
            <span>নাম চাপলেই সরাসরি WhatsApp চ্যাট খুলবে। বাটনটা টেনে অন্য জায়গায় সরানো যায়।</span>
            {pos && (
              <button
                type="button"
                onClick={resetPosition}
                className="shrink-0 rounded-full border border-[var(--color-paper-line)] bg-white px-2 py-0.5 font-semibold text-[var(--color-ink)] hover:bg-[var(--color-paper-line)]"
              >
                আগের জায়গায়
              </button>
            )}
          </div>
        </div>
      )}
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        aria-label="যোগাযোগ"
        aria-expanded={open}
        title="চাপলে যোগাযোগ, টেনে সরানো যায়"
        style={{ touchAction: "none" }}
        className={`flex select-none items-center gap-2 rounded-full bg-[#25d366] px-4 py-3 font-display text-sm font-bold text-white shadow-xl shadow-black/25 transition-[filter,transform,box-shadow] hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#128c7e] ${
          dragging ? "scale-110 cursor-grabbing shadow-2xl" : "cursor-grab active:scale-95"
        }`}
      >
        {open ? (
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <WhatsAppIcon className="h-6 w-6" />
        )}
        <span className="hidden sm:inline">যোগাযোগ</span>
      </button>
    </div>
  );
}
