"use client";

import { useState, useRef, useCallback, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type DoorStyle = "raised-panel" | "carriage" | "flush" | "full-view" | "ranch" | "short-panel";
type WindowOpt = "none" | "top-row-rect" | "top-row-arch" | "double-row" | "full-view" | "decorative";
type GlassOpt  = "clear" | "frosted" | "bronze" | "grey" | "rain";
type HardwareOpt = "standard" | "decorative" | "none";

interface DoorColor { name: string; hex: string; }

// ─── Data ─────────────────────────────────────────────────────────────────────
const DOOR_STYLES: { id: DoorStyle; label: string; sub: string }[] = [
  { id: "raised-panel",  label: "Raised Panel",      sub: "Classic & Traditional"   },
  { id: "carriage",      label: "Carriage House",     sub: "Rustic Charm"            },
  { id: "flush",         label: "Contemporary Flush", sub: "Clean & Modern"          },
  { id: "full-view",     label: "Full-View Glass",    sub: "Modern & Open"           },
  { id: "ranch",         label: "Ranch Panel",        sub: "Horizontal Grooves"      },
  { id: "short-panel",   label: "Short Panel",        sub: "Bold & Distinctive"      },
];

const DOOR_COLORS: DoorColor[] = [
  { name: "White",          hex: "#FFFFFF" },
  { name: "Almond",         hex: "#F5E6C8" },
  { name: "Sandstone",      hex: "#C4A882" },
  { name: "Desert Tan",     hex: "#C9A66B" },
  { name: "Clayboard",      hex: "#B89060" },
  { name: "Dark Brown",     hex: "#4A2C17" },
  { name: "Black",          hex: "#1A1A1A" },
  { name: "Bronze",         hex: "#614B3A" },
  { name: "Forest Green",   hex: "#2D4A2D" },
  { name: "Navy Blue",      hex: "#1A2B4A" },
  { name: "Cranberry",      hex: "#8B1F2E" },
  { name: "Silver",         hex: "#A8A8A8" },
];

const WINDOW_OPTS: { id: WindowOpt; label: string; desc: string }[] = [
  { id: "none",          label: "No Windows",       desc: "Clean, no glass inserts"           },
  { id: "top-row-rect",  label: "Top Row Rectangle",desc: "Single row of rectangular windows" },
  { id: "top-row-arch",  label: "Top Row Arch",     desc: "Single row of arched-top windows"  },
  { id: "double-row",    label: "Double Row",       desc: "Two rows of rectangular windows"   },
  { id: "full-view",     label: "Full View Glass",  desc: "Glass panels throughout the door"  },
  { id: "decorative",    label: "Decorative Iron",  desc: "Wrought iron insert windows"       },
];

const GLASS_OPTS: { id: GlassOpt; label: string; hex: string }[] = [
  { id: "clear",   label: "Clear",       hex: "#E8F4F8" },
  { id: "frosted", label: "Frosted",     hex: "#D0D8DC" },
  { id: "bronze",  label: "Bronze Tint", hex: "#C0904A" },
  { id: "grey",    label: "Grey Tint",   hex: "#808890" },
  { id: "rain",    label: "Rain Glass",  hex: "#B8C8D0" },
];

const HARDWARE_OPTS: { id: HardwareOpt; label: string; desc: string }[] = [
  { id: "standard",   label: "Standard",   desc: "Clean functional hardware" },
  { id: "decorative", label: "Decorative", desc: "Carriage-style straps & handles" },
  { id: "none",       label: "Minimal",    desc: "No visible hardware" },
];

const LOADING_MESSAGES = [
  "Sending your photo to AI…",
  "Analysing the garage opening…",
  "Applying your door style…",
  "Adding colours and windows…",
  "Rendering shadows and lighting…",
  "Almost there — final touches…",
];

// ─── SVG Door Icons ────────────────────────────────────────────────────────────
function DoorIcon({ style, size = 56 }: { style: DoorStyle; size?: number }) {
  const w = size; const h = Math.round(size * 1.1);
  const s: React.CSSProperties = { display: "block" };
  if (style === "raised-panel") return (
    <svg width={w} height={h} viewBox="0 0 56 62" style={s} fill="none">
      <rect x="2" y="2" width="52" height="58" rx="2" fill="#E8E8E8" stroke="#BBBBB" strokeWidth="2"/>
      <rect x="7"  y="7"  width="18" height="22" rx="1" fill="none" stroke="#999" strokeWidth="1.5"/>
      <rect x="31" y="7"  width="18" height="22" rx="1" fill="none" stroke="#999" strokeWidth="1.5"/>
      <rect x="7"  y="33" width="18" height="22" rx="1" fill="none" stroke="#999" strokeWidth="1.5"/>
      <rect x="31" y="33" width="18" height="22" rx="1" fill="none" stroke="#999" strokeWidth="1.5"/>
    </svg>
  );
  if (style === "carriage") return (
    <svg width={w} height={h} viewBox="0 0 56 62" style={s} fill="none">
      <rect x="2" y="2" width="52" height="58" rx="2" fill="#E8E8E8" stroke="#BBB" strokeWidth="2"/>
      <line x1="28" y1="2" x2="28" y2="60" stroke="#999" strokeWidth="1.5"/>
      <rect x="7"  y="8"  width="16" height="14" rx="1" fill="none" stroke="#999" strokeWidth="1.5"/>
      <rect x="33" y="8"  width="16" height="14" rx="1" fill="none" stroke="#999" strokeWidth="1.5"/>
      <line x1="4"  y1="14" x2="52" y2="14" stroke="#777" strokeWidth="1" strokeDasharray="3 2"/>
      <line x1="4"  y1="38" x2="52" y2="38" stroke="#777" strokeWidth="1" strokeDasharray="3 2"/>
      <rect x="8"  y="41" width="12" height="4" rx="1" fill="#999"/>
      <rect x="36" y="41" width="12" height="4" rx="1" fill="#999"/>
    </svg>
  );
  if (style === "flush") return (
    <svg width={w} height={h} viewBox="0 0 56 62" style={s} fill="none">
      <rect x="2" y="2" width="52" height="58" rx="2" fill="#E0E0E0" stroke="#BBB" strokeWidth="2"/>
      <line x1="2"  y1="21" x2="54" y2="21" stroke="#CCC" strokeWidth="1"/>
      <line x1="2"  y1="40" x2="54" y2="40" stroke="#CCC" strokeWidth="1"/>
      <rect x="7"  y="5"  width="42" height="14" rx="1" fill="#D8D8D8"/>
      <rect x="7"  y="23" width="42" height="15" rx="1" fill="#D8D8D8"/>
      <rect x="7"  y="42" width="42" height="16" rx="1" fill="#D8D8D8"/>
    </svg>
  );
  if (style === "full-view") return (
    <svg width={w} height={h} viewBox="0 0 56 62" style={s} fill="none">
      <rect x="2" y="2" width="52" height="58" rx="2" fill="#C8D8E0" stroke="#888" strokeWidth="2.5"/>
      <rect x="6"  y="6"  width="19" height="49" rx="1" fill="#D8EEF8" stroke="#999" strokeWidth="1"/>
      <rect x="31" y="6"  width="19" height="49" rx="1" fill="#D8EEF8" stroke="#999" strokeWidth="1"/>
      <line x1="6"  y1="22" x2="25" y2="22" stroke="#AAA" strokeWidth="0.8"/>
      <line x1="6"  y1="38" x2="25" y2="38" stroke="#AAA" strokeWidth="0.8"/>
      <line x1="31" y1="22" x2="50" y2="22" stroke="#AAA" strokeWidth="0.8"/>
      <line x1="31" y1="38" x2="50" y2="38" stroke="#AAA" strokeWidth="0.8"/>
    </svg>
  );
  if (style === "ranch") return (
    <svg width={w} height={h} viewBox="0 0 56 62" style={s} fill="none">
      <rect x="2" y="2" width="52" height="58" rx="2" fill="#E8E8E8" stroke="#BBB" strokeWidth="2"/>
      {[10, 18, 26, 34, 42, 50].map((y) => (
        <line key={y} x1="4" y1={y} x2="52" y2={y} stroke="#CCC" strokeWidth="1.5"/>
      ))}
      {[10, 18, 26, 34, 42, 50].map((y) => (
        <line key={`g${y}`} x1="4" y1={y + 2} x2="52" y2={y + 2} stroke="#BBB" strokeWidth="0.5"/>
      ))}
    </svg>
  );
  // short-panel
  return (
    <svg width={w} height={h} viewBox="0 0 56 62" style={s} fill="none">
      <rect x="2" y="2" width="52" height="58" rx="2" fill="#E8E8E8" stroke="#BBB" strokeWidth="2"/>
      <rect x="7"  y="7"  width="18" height="12" rx="1" fill="none" stroke="#999" strokeWidth="1.5"/>
      <rect x="31" y="7"  width="18" height="12" rx="1" fill="none" stroke="#999" strokeWidth="1.5"/>
      <rect x="7"  y="23" width="18" height="12" rx="1" fill="none" stroke="#999" strokeWidth="1.5"/>
      <rect x="31" y="23" width="18" height="12" rx="1" fill="none" stroke="#999" strokeWidth="1.5"/>
      <rect x="7"  y="39" width="18" height="12" rx="1" fill="none" stroke="#999" strokeWidth="1.5"/>
      <rect x="31" y="39" width="18" height="12" rx="1" fill="none" stroke="#999" strokeWidth="1.5"/>
    </svg>
  );
}

function WindowIcon({ opt, size = 44 }: { opt: WindowOpt; size?: number }) {
  const w = size; const h = Math.round(size * 0.9);
  const s: React.CSSProperties = { display: "block" };
  if (opt === "none") return (
    <svg width={w} height={h} viewBox="0 0 44 40" style={s} fill="none">
      <rect x="2" y="2" width="40" height="36" rx="2" fill="#E0E0E0" stroke="#BBB" strokeWidth="1.5"/>
      <line x1="12" y1="12" x2="32" y2="28" stroke="#CCC" strokeWidth="2"/>
      <line x1="32" y1="12" x2="12" y2="28" stroke="#CCC" strokeWidth="2"/>
    </svg>
  );
  if (opt === "top-row-rect") return (
    <svg width={w} height={h} viewBox="0 0 44 40" style={s} fill="none">
      <rect x="2" y="2" width="40" height="36" rx="2" fill="#E0E0E0" stroke="#BBB" strokeWidth="1.5"/>
      <rect x="5"  y="5"  width="10" height="9" rx="1" fill="#C8E4F0" stroke="#999" strokeWidth="1"/>
      <rect x="17" y="5"  width="10" height="9" rx="1" fill="#C8E4F0" stroke="#999" strokeWidth="1"/>
      <rect x="29" y="5"  width="10" height="9" rx="1" fill="#C8E4F0" stroke="#999" strokeWidth="1"/>
    </svg>
  );
  if (opt === "top-row-arch") return (
    <svg width={w} height={h} viewBox="0 0 44 40" style={s} fill="none">
      <rect x="2" y="2" width="40" height="36" rx="2" fill="#E0E0E0" stroke="#BBB" strokeWidth="1.5"/>
      <path d="M5 14 Q5 5 10.5 5 Q16 5 16 14 Z" fill="#C8E4F0" stroke="#999" strokeWidth="1"/>
      <path d="M17 14 Q17 5 22.5 5 Q28 5 28 14 Z" fill="#C8E4F0" stroke="#999" strokeWidth="1"/>
      <path d="M29 14 Q29 5 34.5 5 Q40 5 40 14 Z" fill="#C8E4F0" stroke="#999" strokeWidth="1"/>
      <rect x="5"  y="13.5" width="11" height="0.5" fill="#999"/>
      <rect x="17" y="13.5" width="11" height="0.5" fill="#999"/>
      <rect x="29" y="13.5" width="11" height="0.5" fill="#999"/>
    </svg>
  );
  if (opt === "double-row") return (
    <svg width={w} height={h} viewBox="0 0 44 40" style={s} fill="none">
      <rect x="2" y="2" width="40" height="36" rx="2" fill="#E0E0E0" stroke="#BBB" strokeWidth="1.5"/>
      <rect x="5"  y="4"  width="10" height="7" rx="1" fill="#C8E4F0" stroke="#999" strokeWidth="1"/>
      <rect x="17" y="4"  width="10" height="7" rx="1" fill="#C8E4F0" stroke="#999" strokeWidth="1"/>
      <rect x="29" y="4"  width="10" height="7" rx="1" fill="#C8E4F0" stroke="#999" strokeWidth="1"/>
      <rect x="5"  y="13" width="10" height="7" rx="1" fill="#C8E4F0" stroke="#999" strokeWidth="1"/>
      <rect x="17" y="13" width="10" height="7" rx="1" fill="#C8E4F0" stroke="#999" strokeWidth="1"/>
      <rect x="29" y="13" width="10" height="7" rx="1" fill="#C8E4F0" stroke="#999" strokeWidth="1"/>
    </svg>
  );
  if (opt === "full-view") return (
    <svg width={w} height={h} viewBox="0 0 44 40" style={s} fill="none">
      <rect x="2" y="2" width="40" height="36" rx="2" fill="#C8E4F0" stroke="#888" strokeWidth="1.5"/>
      <rect x="5"  y="5"  width="16" height="30" rx="1" fill="#D8EEF8" stroke="#999" strokeWidth="1"/>
      <rect x="23" y="5"  width="16" height="30" rx="1" fill="#D8EEF8" stroke="#999" strokeWidth="1"/>
    </svg>
  );
  // decorative
  return (
    <svg width={w} height={h} viewBox="0 0 44 40" style={s} fill="none">
      <rect x="2" y="2" width="40" height="36" rx="2" fill="#E0E0E0" stroke="#BBB" strokeWidth="1.5"/>
      <rect x="5"  y="5"  width="10" height="9" rx="1" fill="#C8E4F0" stroke="#999" strokeWidth="1"/>
      <rect x="17" y="5"  width="10" height="9" rx="1" fill="#C8E4F0" stroke="#999" strokeWidth="1"/>
      <rect x="29" y="5"  width="10" height="9" rx="1" fill="#C8E4F0" stroke="#999" strokeWidth="1"/>
      <line x1="5"  y1="5"  x2="15" y2="14" stroke="#777" strokeWidth="0.8"/>
      <line x1="15" y1="5"  x2="5"  y2="14" stroke="#777" strokeWidth="0.8"/>
      <line x1="17" y1="5"  x2="27" y2="14" stroke="#777" strokeWidth="0.8"/>
      <line x1="27" y1="5"  x2="17" y2="14" stroke="#777" strokeWidth="0.8"/>
      <line x1="29" y1="5"  x2="39" y2="14" stroke="#777" strokeWidth="0.8"/>
      <line x1="39" y1="5"  x2="29" y2="14" stroke="#777" strokeWidth="0.8"/>
    </svg>
  );
}

function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/>
      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75"/>
    </svg>
  );
}

function BrandStripe() {
  return (
    <div className="h-1 w-full" style={{
      background: "linear-gradient(to right, #B8962E, #2A4A3A, #3DA2A9, #6B3A2A, #C75E29)"
    }}/>
  );
}

function IntroRaisedPanel() {
  // recessed bevel frame with a raised centre face, like an embossed steel panel
  return (
    <div
      className="flex-1 rounded-[3px]"
      style={{
        background: "linear-gradient(to bottom, #D2CEC5 0%, #C4C0B6 100%)",
        boxShadow: "inset 2px 3px 4px rgba(0,0,0,0.18), inset -2px -2px 3px rgba(255,255,255,0.55)",
        padding: "7%",
      }}
    >
      <div
        className="w-full h-full rounded-[2px]"
        style={{
          background: "linear-gradient(to bottom, #F4F1EA 0%, #E7E3DA 55%, #DAD6CC 100%)",
          boxShadow: "1px 2px 3px rgba(0,0,0,0.15), inset 0 1px 1px rgba(255,255,255,0.9)",
        }}
      />
    </div>
  );
}

function IntroWindow() {
  return (
    <div
      className="flex-1 rounded-[3px] relative overflow-hidden"
      style={{
        background: "linear-gradient(to bottom, #B4B0A7 0%, #C8C4BA 100%)",
        boxShadow: "inset 2px 3px 4px rgba(0,0,0,0.22), inset -1px -1px 2px rgba(255,255,255,0.4)",
        padding: "6%",
      }}
    >
      <div
        className="w-full h-full rounded-[2px] relative overflow-hidden flex"
        style={{
          background: "linear-gradient(to bottom, #7A96A8 0%, #A8C2D0 40%, #8FAABB 100%)",
          boxShadow: "inset 0 2px 8px rgba(0,0,0,0.35)",
        }}
      >
        {/* mullions */}
        <div className="absolute inset-y-0 left-1/3 w-[3px] bg-[#DDD9D0] shadow-sm"/>
        <div className="absolute inset-y-0 left-2/3 w-[3px] bg-[#DDD9D0] shadow-sm"/>
        {/* diagonal glare */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.45) 32%, rgba(255,255,255,0.1) 40%, transparent 48%, rgba(255,255,255,0.25) 62%, transparent 70%)",
          }}
        />
      </div>
    </div>
  );
}

function GarageDoorIntro({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [onDone]);

  // Full-screen sectional garage door that rolls up to reveal the site.
  // 5 sections: top window section + 4 embossed raised-panel sections.
  return (
    <div className="garage-intro fixed inset-0 z-[100] overflow-hidden pointer-events-none bg-corgan-navy-dark">

      {/* lintel / header above the opening */}
      <div
        className="absolute top-0 inset-x-0 h-4 sm:h-5 z-20"
        style={{
          background: "linear-gradient(to bottom, #3A3633 0%, #55504A 50%, #2E2B27 100%)",
          boxShadow: "0 3px 8px rgba(0,0,0,0.5)",
        }}
      />

      {/* side tracks */}
      {(["left-0", "right-0"] as const).map((side) => (
        <div
          key={side}
          className={`absolute inset-y-0 ${side} w-3 sm:w-5 z-20 flex flex-col justify-around items-center`}
          style={{
            background: "linear-gradient(to right, #4A463F 0%, #6B665E 45%, #3A3630 100%)",
            boxShadow: side === "left-0" ? "2px 0 6px rgba(0,0,0,0.45)" : "-2px 0 6px rgba(0,0,0,0.45)",
          }}
        >
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full"
                 style={{ background: "radial-gradient(circle at 35% 35%, #8A857C, #2E2B27)" }}/>
          ))}
        </div>
      ))}

      {/* the door itself */}
      <div className="garage-intro-door absolute inset-0 px-3 sm:px-5 pt-4 sm:pt-5">
        <div className="garage-intro-rumble w-full h-full flex flex-col relative"
             style={{ boxShadow: "0 10px 25px rgba(0,0,0,0.55)" }}>

          {/* Section 1 — windows */}
          <div
            className="flex gap-2 sm:gap-3 px-3 sm:px-6 py-2.5 sm:py-4"
            style={{
              flex: "0 0 17%",
              background: "linear-gradient(to bottom, #F2EFE8 0%, #E5E1D8 70%, #D5D1C7 100%)",
              borderBottom: "1px solid rgba(0,0,0,0.28)",
              boxShadow: "inset 0 -2px 3px rgba(0,0,0,0.12), inset 0 2px 2px rgba(255,255,255,0.7)",
            }}
          >
            {[0, 1, 2, 3].map((i) => <IntroWindow key={i}/>)}
          </div>

          {/* Sections 2–5 — embossed raised panels */}
          {[0, 1, 2, 3].map((row) => (
            <div
              key={row}
              className="flex gap-2 sm:gap-3 px-3 sm:px-6 py-2.5 sm:py-4 flex-1"
              style={{
                background: "linear-gradient(to bottom, #F2EFE8 0%, #E5E1D8 70%, #D5D1C7 100%)",
                borderBottom: row < 3 ? "1px solid rgba(0,0,0,0.28)" : "none",
                boxShadow: "inset 0 -2px 3px rgba(0,0,0,0.12), inset 0 2px 2px rgba(255,255,255,0.7)",
              }}
            >
              {[0, 1, 2, 3].map((i) => <IntroRaisedPanel key={i}/>)}
            </div>
          ))}

          {/* lift handle on second-from-bottom section */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-[23%] flex items-center justify-center z-10">
            <div className="w-16 sm:w-20 h-3.5 sm:h-4 rounded-full"
                 style={{
                   background: "linear-gradient(to bottom, #9A958C 0%, #6B665E 50%, #4A463F 100%)",
                   boxShadow: "0 2px 4px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.5)",
                 }}/>
          </div>

          {/* logo badge centered on the door */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
            <div className="garage-intro-logo bg-corgan-navy rounded-2xl px-8 py-6"
                 style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.15)" }}>
              <img src="/corgan-logo-white.png" alt="Corgan Enterprises" className="h-14 sm:h-20 w-auto object-contain"/>
            </div>
            <p className="garage-intro-logo text-corgan-navy/70 text-xs sm:text-sm font-bold tracking-[0.25em] uppercase"
               style={{ textShadow: "0 1px 0 rgba(255,255,255,0.6)" }}>
              Garage Door Visualizer
            </p>
          </div>

          {/* ambient lighting: darker edges, soft top light */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 120% 90% at 50% 35%, transparent 55%, rgba(0,0,0,0.18) 100%), linear-gradient(to bottom, rgba(255,255,255,0.12) 0%, transparent 12%)",
            }}
          />

          {/* rubber bottom seal */}
          <div
            className="absolute bottom-0 inset-x-0 h-2.5 sm:h-3"
            style={{
              background: "linear-gradient(to bottom, #2A2825 0%, #1A1917 60%, #0E0D0C 100%)",
              boxShadow: "0 2px 5px rgba(0,0,0,0.6)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

function StepBadge({ n }: { n: number }) {
  return (
    <span className="w-5 h-5 rounded-full bg-corgan-navy text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
      {n}
    </span>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function GarageVisualizer() {
  const fileRef   = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const [imageLoaded,  setImageLoaded]  = useState(false);
  const [originalUrl,  setOriginalUrl]  = useState<string | null>(null);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [imageBase64,  setImageBase64]  = useState<string | null>(null);
  const [mimeType,     setMimeType]     = useState("image/jpeg");
  const [dragging,     setDragging]     = useState(false);
  const [view,         setView]         = useState<"original" | "generated">("original");

  // Door options
  const [doorCount, setDoorCount] = useState<1 | 2>(1);
  const [style,    setStyle]    = useState<DoorStyle>("raised-panel");
  const [color,    setColor]    = useState<DoorColor>(DOOR_COLORS[0]);
  const [windows,  setWindows]  = useState<WindowOpt>("top-row-rect");
  const [glass,    setGlass]    = useState<GlassOpt>("clear");
  const [hardware, setHardware] = useState<HardwareOpt>("standard");

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(0);
  const [genError,   setGenError]   = useState("");
  const [showContact, setShowContact] = useState(false);
  const [showIntro,  setShowIntro]  = useState(true);

  const loadFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/") && !/\.(heic|heif)$/i.test(file.name)) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const max = 1400;
        const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
        canvas.width  = Math.round(img.naturalWidth  * scale);
        canvas.height = Math.round(img.naturalHeight * scale);
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
        const jpeg = canvas.toDataURL("image/jpeg", 0.92);
        setOriginalUrl(jpeg);
        setImageBase64(jpeg.split(",")[1]);
        setMimeType("image/jpeg");
        setImageLoaded(true);
        setGeneratedUrl(null);
        setView("original");
        setGenError("");
      };
      img.onerror = () => {
        setOriginalUrl(dataUrl);
        setImageBase64(dataUrl.split(",")[1]);
        setMimeType(file.type || "image/jpeg");
        setImageLoaded(true);
        setGeneratedUrl(null);
        setView("original");
        setGenError("");
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }, []);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) loadFile(f);
  };

  const generate = async () => {
    if (!imageBase64) return;
    setGenerating(true);
    setGenError("");
    setLoadingMsg(0);
    const interval = setInterval(() => {
      setLoadingMsg((n) => Math.min(n + 1, LOADING_MESSAGES.length - 1));
    }, 7000);
    try {
      const res = await fetch("/api/visualize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64,
          mimeType,
          doorCount,
          style,
          colorName: color.name,
          colorHex:  color.hex,
          windows,
          glass: windows === "none" ? "clear" : glass,
          hardware,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setGeneratedUrl(`data:image/png;base64,${data.imageBase64}`);
      setView("generated");
      setShowContact(true);
    } catch (err: unknown) {
      setGenError(err instanceof Error ? err.message : "Generation failed.");
    } finally {
      clearInterval(interval);
      setGenerating(false);
    }
  };

  const download = () => {
    const url = view === "generated" && generatedUrl ? generatedUrl : originalUrl;
    if (!url) return;
    const a = document.createElement("a");
    a.download = `corgan-garage-${view}-${Date.now()}.png`;
    a.href = url;
    a.click();
  };

  const reset = () => {
    setImageLoaded(false);
    setOriginalUrl(null);
    setGeneratedUrl(null);
    setImageBase64(null);
    setView("original");
    setGenError("");
    setShowContact(false);
  };

  const selectedWindows = windows !== "none";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {showIntro && <GarageDoorIntro onDone={() => setShowIntro(false)}/>}

      {/* ── Header ── */}
      <header className="bg-corgan-navy text-white shadow-lg sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-shrink-0">
            <a href="https://corgan.ca" target="_blank" rel="noopener noreferrer">
              <img src="/corgan-logo-white.png" alt="Corgan Enterprises"
                   className="h-10 sm:h-12 w-auto object-contain"/>
            </a>
            <div className="hidden sm:block pl-3 border-l border-white/20">
              <p className="text-xs font-semibold text-white/90 leading-tight">Garage Door</p>
              <p className="text-xs text-corgan-gold leading-tight">Visualizer</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="tel:+17802152769"
               className="hidden sm:flex items-center gap-1.5 text-xs text-white/80 hover:text-corgan-gold transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
              (780) 215-2769
            </a>
            <a href="tel:+17802152769"
               className="px-3 py-2 bg-corgan-gold text-white text-xs font-bold rounded-lg shadow-sm hover:bg-corgan-gold-dark transition-colors">
              Get a Quote
            </a>
          </div>
        </div>
        <BrandStripe/>
      </header>

      {/* ── Hero ── */}
      <section className="bg-corgan-navy text-white py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
            See Your New Garage Door{" "}
            <span className="text-corgan-gold">Before You Buy</span>
          </h1>
          <p className="text-white/70 text-sm sm:text-base max-w-xl mx-auto">
            Upload a photo of your home, choose your door style, colour, and windows —
            our AI shows you exactly how it will look.
          </p>
        </div>
      </section>

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 py-5 sm:px-4 sm:py-6 lg:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6 items-start">

          {/* ── Left: Image panel ── */}
          <div className="lg:col-span-3 flex flex-col gap-4">

            {/* Upload zone */}
            {!imageLoaded && (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); loadFile(e.dataTransfer.files[0]); }}
                onClick={() => fileRef.current?.click()}
                className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all cursor-pointer min-h-[300px] sm:min-h-[420px] ${
                  dragging ? "border-corgan-gold bg-corgan-gold/5" : "border-gray-300 bg-white"
                }`}
              >
                <div className="text-6xl sm:text-8xl mb-4 select-none">🏠</div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-700 mb-1">
                  Upload Your Garage Photo
                </h2>
                <p className="text-gray-400 text-sm text-center mb-6 max-w-xs px-4">
                  Take a straight-on photo of your garage door for the best results
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
                    className="px-5 py-3 bg-corgan-navy text-white text-sm font-bold rounded-xl shadow-sm"
                  >
                    Browse Files
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); cameraRef.current?.click(); }}
                    className="px-5 py-3 border-2 border-gray-200 text-gray-600 text-sm font-bold rounded-xl"
                  >
                    📷 Camera
                  </button>
                </div>
                <input ref={fileRef}   type="file" accept="image/*"            className="hidden" onChange={onFile}/>
                <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onFile}/>
              </div>
            )}

            {/* Image viewer */}
            {imageLoaded && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b border-gray-100">
                  {(["original", "generated"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => tab === "generated" && generatedUrl && setView("generated") || tab === "original" && setView("original")}
                      disabled={tab === "generated" && !generatedUrl}
                      className={`flex-1 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed ${
                        view === tab
                          ? tab === "original"
                            ? "text-corgan-navy border-b-2 border-corgan-navy"
                            : "text-corgan-gold border-b-2 border-corgan-gold"
                          : generatedUrl || tab === "original"
                          ? "text-gray-400"
                          : "text-gray-200"
                      }`}
                    >
                      {tab === "original" ? "Original" : (
                        <>✨ AI Result{generatedUrl && (
                          <span className="ml-1.5 inline-block w-2 h-2 rounded-full bg-corgan-teal align-middle"/>
                        )}</>
                      )}
                    </button>
                  ))}
                </div>

                {/* Image area */}
                <div className="relative bg-gray-50 min-h-[240px] flex items-center justify-center">
                  {generating && (
                    <div className="absolute inset-0 bg-corgan-navy/85 flex flex-col items-center justify-center z-10">
                      <Spinner className="h-10 w-10 text-corgan-gold mb-4"/>
                      <p className="text-white font-semibold text-sm px-6 text-center">
                        {LOADING_MESSAGES[loadingMsg]}
                      </p>
                      <p className="text-white/50 text-xs mt-2">Usually takes 20–40 seconds</p>
                    </div>
                  )}
                  {view === "original" && originalUrl && (
                    <img src={originalUrl} alt="Original garage" className="w-full h-auto block max-h-[60vh] object-contain"/>
                  )}
                  {view === "generated" && generatedUrl && (
                    <img src={generatedUrl} alt="AI visualized garage door" className="w-full h-auto block max-h-[60vh] object-contain"/>
                  )}
                  {view === "generated" && !generatedUrl && !generating && (
                    <div className="py-16 text-center text-gray-400">
                      <p className="text-5xl mb-3">🚪</p>
                      <p className="text-sm">Configure your door and tap <strong className="text-corgan-gold">Visualize</strong></p>
                    </div>
                  )}
                </div>

                {/* Config chip on result */}
                {view === "generated" && generatedUrl && (
                  <div className="px-4 py-2 bg-corgan-gold/10 border-t border-corgan-gold/20 flex items-center gap-2 flex-wrap">
                    <div className="w-4 h-4 rounded border border-black/10 flex-shrink-0" style={{ backgroundColor: color.hex }}/>
                    <p className="text-xs font-medium text-corgan-navy">
                      {DOOR_STYLES.find(s => s.id === style)?.label} · {color.name} ·{" "}
                      {WINDOW_OPTS.find(w => w.id === windows)?.label}
                    </p>
                  </div>
                )}

                {/* Toolbar */}
                <div className="px-3 py-2.5 border-t border-gray-100 flex items-center gap-2">
                  <button onClick={reset}
                          className="px-3 py-2 text-xs font-medium border border-gray-200 rounded-lg bg-white">
                    📂 New Photo
                  </button>
                  <div className="flex-1"/>
                  <button onClick={download}
                          className="px-4 py-2 text-xs font-bold bg-corgan-navy text-white rounded-lg shadow-sm">
                    ⬇ Download
                  </button>
                </div>
              </div>
            )}

            {/* How it works — shown before upload */}
            {!imageLoaded && (
              <div className="bg-corgan-navy rounded-2xl p-5 text-white">
                <h3 className="font-bold mb-3 text-sm tracking-wide uppercase text-corgan-gold">
                  How It Works
                </h3>
                <ol className="text-xs leading-relaxed text-white/70 space-y-2 list-decimal list-inside">
                  <li>Upload a straight-on photo of your garage</li>
                  <li>Choose your door style from our available options</li>
                  <li>Pick a colour, window layout, and glass type</li>
                  <li>Tap Visualize — AI replaces your door photorealistically</li>
                  <li>Love it? Call us for a free quote</li>
                </ol>
                <div className="mt-4"><BrandStripe/></div>
              </div>
            )}
          </div>

          {/* ── Right: Options panel ── */}
          <div className="lg:col-span-2 flex flex-col gap-3">

            {/* ── Step 1: How Many Doors ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-3">
                <StepBadge n={1}/>
                <h3 className="font-bold text-corgan-navy text-sm uppercase tracking-wide">How Many Doors?</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {([1, 2] as const).map((n) => (
                  <button
                    key={n}
                    onClick={() => setDoorCount(n)}
                    className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                      doorCount === n
                        ? "border-corgan-gold bg-corgan-gold/5"
                        : "border-gray-100 bg-gray-50/50 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex gap-1.5">
                      <DoorIcon style="raised-panel" size={n === 1 ? 44 : 34}/>
                      {n === 2 && <DoorIcon style="raised-panel" size={34}/>}
                    </div>
                    <span className="text-xs font-semibold text-gray-700 mt-1.5">
                      {n === 1 ? "Single Door" : "Double / Two Doors"}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {n === 1 ? "One garage door" : "Both doors get the same style"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Step 2: Door Style ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-3">
                <StepBadge n={2}/>
                <h3 className="font-bold text-corgan-navy text-sm uppercase tracking-wide">Door Style</h3>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {DOOR_STYLES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStyle(s.id)}
                    className={`flex flex-col items-center p-2 rounded-xl border-2 transition-all text-center ${
                      style === s.id
                        ? "border-corgan-gold bg-corgan-gold/5"
                        : "border-gray-100 bg-gray-50/50 hover:border-gray-300"
                    }`}
                  >
                    <DoorIcon style={s.id} size={48}/>
                    <span className="text-[10px] font-semibold text-gray-700 mt-1.5 leading-tight">{s.label}</span>
                    <span className="text-[9px] text-gray-400 leading-tight">{s.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Step 2: Colour ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-3">
                <StepBadge n={3}/>
                <h3 className="font-bold text-corgan-navy text-sm uppercase tracking-wide">Colour</h3>
                <span className="ml-auto text-xs font-medium text-gray-500 flex items-center gap-1">
                  <span className="w-3.5 h-3.5 rounded border border-black/10 inline-block"
                        style={{ backgroundColor: color.hex }}/>
                  {color.name}
                </span>
              </div>
              <div className="grid grid-cols-6 gap-1.5">
                {DOOR_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    title={c.name}
                    onClick={() => setColor(c)}
                    className={`w-full aspect-square rounded-lg border-2 transition-all ${
                      color.hex === c.hex
                        ? "border-corgan-gold scale-110 shadow-md"
                        : "border-transparent hover:border-gray-400"
                    }`}
                    style={{ backgroundColor: c.hex, boxShadow: c.hex === "#FFFFFF" ? "inset 0 0 0 1px #ddd" : undefined }}
                  />
                ))}
              </div>
            </div>

            {/* ── Step 3: Window Configuration ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-3">
                <StepBadge n={4}/>
                <h3 className="font-bold text-corgan-navy text-sm uppercase tracking-wide">Windows</h3>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {WINDOW_OPTS.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => setWindows(w.id)}
                    className={`flex flex-col items-center p-2 rounded-xl border-2 transition-all text-center ${
                      windows === w.id
                        ? "border-corgan-gold bg-corgan-gold/5"
                        : "border-gray-100 bg-gray-50/50 hover:border-gray-300"
                    }`}
                  >
                    <WindowIcon opt={w.id} size={40}/>
                    <span className="text-[10px] font-semibold text-gray-700 mt-1.5 leading-tight">{w.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Step 4: Glass Type (only when windows selected) ── */}
            {selectedWindows && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <StepBadge n={5}/>
                  <h3 className="font-bold text-corgan-navy text-sm uppercase tracking-wide">Glass Type</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {GLASS_OPTS.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setGlass(g.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-xs font-semibold transition-all ${
                        glass === g.id
                          ? "border-corgan-gold bg-corgan-gold/5 text-corgan-navy"
                          : "border-gray-100 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      <span className="w-5 h-5 rounded border border-black/10 flex-shrink-0 inline-block"
                            style={{ backgroundColor: g.hex }}/>
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Step 5: Hardware ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-3">
                <StepBadge n={selectedWindows ? 6 : 5}/>
                <h3 className="font-bold text-corgan-navy text-sm uppercase tracking-wide">Hardware</h3>
              </div>
              <div className="flex flex-col gap-2">
                {HARDWARE_OPTS.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => setHardware(h.id)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 text-left transition-all ${
                      hardware === h.id
                        ? "border-corgan-gold bg-corgan-gold/5"
                        : "border-gray-100 bg-gray-50/50 hover:border-gray-300"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                      hardware === h.id ? "border-corgan-gold bg-corgan-gold" : "border-gray-300"
                    }`}/>
                    <div>
                      <p className="text-xs font-semibold text-gray-800">{h.label}</p>
                      <p className="text-[10px] text-gray-400">{h.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Generate Button ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              {/* Config summary */}
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl mb-4">
                <div className="w-10 h-12 flex-shrink-0">
                  <DoorIcon style={style} size={40}/>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-corgan-navy truncate">
                    {doorCount === 2 ? "2× " : ""}{DOOR_STYLES.find(s => s.id === style)?.label}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {color.name} · {WINDOW_OPTS.find(w => w.id === windows)?.label}
                    {selectedWindows ? ` · ${GLASS_OPTS.find(g => g.id === glass)?.label}` : ""}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {HARDWARE_OPTS.find(h => h.id === hardware)?.label} hardware
                  </p>
                </div>
                <div className="w-6 h-6 rounded border border-black/10 flex-shrink-0 mt-1"
                     style={{ backgroundColor: color.hex, boxShadow: color.hex === "#FFFFFF" ? "inset 0 0 0 1px #ddd" : undefined }}/>
              </div>

              <button
                onClick={generate}
                disabled={!imageLoaded || generating}
                className="w-full py-4 bg-corgan-gold text-white font-bold text-base rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:bg-corgan-gold-dark transition-colors"
              >
                {generating
                  ? <><Spinner/> Visualizing…</>
                  : !imageLoaded
                  ? "Upload a photo first"
                  : "🚪 Visualize My Door"}
              </button>

              {genError && (
                <p className="mt-2 text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2 leading-relaxed">
                  {genError}
                </p>
              )}
              <p className="mt-2 text-xs text-center text-gray-400">Takes ~20–40 seconds</p>
            </div>
          </div>
        </div>

        {/* ── Services section ── */}
        <section className="mt-12 mb-8">
          <div className="text-center mb-8">
            <p className="text-xs font-bold tracking-widest text-corgan-gold uppercase mb-1">
              Corgan Enterprises Ltd.
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-corgan-navy">
              Expert Garage Door Services
            </h2>
            <p className="text-gray-500 text-sm mt-2 max-w-lg mx-auto">
              Fort McMurray&apos;s trusted, 100% Indigenous-owned garage door specialists.
              Installation, repair, and maintenance — done right.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: "🚪", title: "New Door Installation", desc: "Full supply and installation of residential garage doors. Steel, aluminum, carriage-house, full-view glass, and more." },
              { icon: "🔧", title: "Repair & Service", desc: "Broken springs, snapped cables, off-track doors, faulty openers — we repair all makes and models fast." },
              { icon: "⚙️", title: "Opener Installation", desc: "Belt drive, chain drive, smart Wi-Fi openers. Supply, install, and setup by our experienced team." },
              { icon: "🛡️", title: "Preventative Maintenance", desc: "Seasonal tune-ups, lubrication, safety inspections, and adjustments to keep your door running smoothly." },
              { icon: "🏗️", title: "Commercial Overhead Doors", desc: "Industrial-grade sectional, rolling steel, and high-speed overhead doors for commercial and industrial facilities." },
              { icon: "📞", title: "Emergency Response", desc: "Garage door stuck open or won't close? We offer rapid-response emergency service calls across Fort McMurray." },
            ].map((svc) => (
              <div key={svc.title} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="text-3xl mb-3">{svc.icon}</div>
                <h3 className="font-bold text-corgan-navy text-sm mb-1">{svc.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{svc.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ── Contact CTA modal ── */}
      {showContact && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowContact(false)}
        >
          <div
            className="relative bg-corgan-navy text-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <BrandStripe/>
            <div className="mt-5 mb-3 text-4xl">🎉</div>
            <h2 className="text-xl font-bold text-corgan-gold mb-1">Looking great!</h2>
            <p className="text-white/80 text-sm leading-relaxed mb-5">
              Ready to make it real? Contact us for a{" "}
              <span className="text-corgan-gold font-bold">free quote</span> — we supply and
              install the exact door you visualized.
            </p>
            <div className="space-y-3 mb-5">
              <a
                href="tel:+17802152769"
                className="flex items-center justify-center gap-2 w-full py-3 bg-corgan-gold hover:bg-corgan-gold-dark text-white font-bold rounded-xl text-sm transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                Call (780) 215-2769
              </a>
              <a
                href="https://wa.me/17802152769"
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-xl text-sm transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp Us
              </a>
              <a
                href="mailto:shayan@corgan.ca"
                className="flex items-center justify-center gap-2 w-full py-3 border border-white/20 text-white/90 font-semibold rounded-xl text-sm hover:border-white/40 transition-colors"
              >
                ✉ shayan@corgan.ca
              </a>
            </div>
            <button onClick={() => setShowContact(false)}
                    className="text-xs text-white/40 hover:text-white/70 transition-colors">
              Keep exploring
            </button>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <footer className="border-t border-gray-200 bg-white">
        <BrandStripe/>
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">
            © 2026 Corgan Enterprises Ltd. · 100% Indigenous-Owned Métis · Fort McMurray, AB
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <a href="tel:+17802152769" className="hover:text-corgan-gold">(780) 215-2769</a>
            <a href="mailto:shayan@corgan.ca" className="hover:text-corgan-gold">shayan@corgan.ca</a>
            <a href="https://corgan.ca" className="hover:text-corgan-gold">corgan.ca</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
