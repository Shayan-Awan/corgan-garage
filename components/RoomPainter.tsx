"use client";

import { useState, useRef, useCallback } from "react";

interface ColorRec {
  name: string;
  hex: string;
  brand: string;
  mood: string;
  reason: string;
}

function BrandStripe() {
  return (
    <div
      className="h-1 w-full"
      style={{
        background:
          "linear-gradient(to right, #B8962E, #2A4A3A, #3DA2A9, #6B3A2A, #C75E29)",
      }}
    />
  );
}

const LOADING_MESSAGES = [
  "Sending your room to AI…",
  "Analysing wall surfaces…",
  "Applying your chosen colour…",
  "Rendering shadows and lighting…",
  "Almost there — finishing touches…",
];

export default function RoomPainter() {
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const [imageLoaded, setImageLoaded] = useState(false);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState("image/jpeg");

  const [recs, setRecs] = useState<ColorRec[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [customHex, setCustomHex] = useState("#FFFFFF");
  const [usingCustom, setUsingCustom] = useState(false);

  const [quality, setQuality] = useState<"low" | "medium">("medium");
  const [analyzing, setAnalyzing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(0);
  const [view, setView] = useState<"original" | "generated">("original");
  const [dragging, setDragging] = useState(false);
  const [analyzeError, setAnalyzeError] = useState("");
  const [paintError, setPaintError] = useState("");

  const activeColor =
    usingCustom || selectedIdx === null
      ? { hex: customHex, name: "Custom Colour" }
      : { hex: recs[selectedIdx].hex, name: recs[selectedIdx].name };

  const loadFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const b64 = dataUrl.split(",")[1];
      setOriginalUrl(dataUrl);
      setImageBase64(b64);
      setMimeType(file.type);
      setImageLoaded(true);
      setGeneratedUrl(null);
      setRecs([]);
      setSelectedIdx(null);
      setUsingCustom(false);
      setView("original");
      setAnalyzeError("");
      setPaintError("");
    };
    reader.readAsDataURL(file);
  }, []);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) loadFile(f);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    loadFile(e.dataTransfer.files[0]);
  };

  const analyze = async () => {
    if (!imageBase64) return;
    setAnalyzing(true);
    setAnalyzeError("");
    try {
      // Downscale for API efficiency
      const img = new window.Image();
      img.src = originalUrl!;
      await new Promise((r) => (img.onload = r));
      const scale = Math.min(1, 900 / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement("canvas");
      c.width = Math.round(img.naturalWidth * scale);
      c.height = Math.round(img.naturalHeight * scale);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      const b64 = c.toDataURL("image/jpeg", 0.85).split(",")[1];

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: b64, mimeType: "image/jpeg" }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setRecs(data.colors);
      setSelectedIdx(0);
      setUsingCustom(false);
    } catch (err: unknown) {
      setAnalyzeError(
        err instanceof Error ? err.message : "Analysis failed. Try again."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const paint = async () => {
    if (!imageBase64) return;
    setGenerating(true);
    setPaintError("");
    setLoadingMsg(0);

    // Rotate loading messages
    const interval = setInterval(() => {
      setLoadingMsg((n) => Math.min(n + 1, LOADING_MESSAGES.length - 1));
    }, 8000);

    try {
      const res = await fetch("/api/paint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64,
          mimeType,
          colorName: activeColor.name,
          colorHex: activeColor.hex,
          quality,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const url = `data:image/png;base64,${data.imageBase64}`;
      setGeneratedUrl(url);
      setView("generated");
    } catch (err: unknown) {
      setPaintError(
        err instanceof Error ? err.message : "Generation failed. Try again."
      );
    } finally {
      clearInterval(interval);
      setGenerating(false);
    }
  };

  const download = () => {
    const url = view === "generated" && generatedUrl ? generatedUrl : originalUrl;
    if (!url) return;
    const a = document.createElement("a");
    a.download = `corgan-room-${view}-${Date.now()}.png`;
    a.href = url;
    a.click();
  };

  const newPhoto = () => {
    setImageLoaded(false);
    setOriginalUrl(null);
    setGeneratedUrl(null);
    setImageBase64(null);
    setRecs([]);
    setSelectedIdx(null);
    setView("original");
    setAnalyzeError("");
    setPaintError("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-corgan-navy text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded bg-corgan-gold flex items-center justify-center shadow">
              <span className="text-white font-black text-2xl leading-none">C</span>
            </div>
            <div>
              <p className="font-bold tracking-widest text-sm">CORGAN ENTERPRISES LTD.</p>
              <p className="text-corgan-gold-light text-xs font-medium">AI Room Colour Visualizer</p>
            </div>
          </div>
          <p className="hidden sm:block text-xs text-corgan-navy-light text-right leading-5">
            100% Indigenous-Owned Métis
            <br />
            General Contracting &amp; Facility Services
          </p>
        </div>
        <BrandStripe />
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 lg:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* ── Left: image area ── */}
          <div className="lg:col-span-2 flex flex-col gap-3">

            {/* Upload zone */}
            {!imageLoaded && (
              <div
                className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed min-h-[420px] transition-all cursor-pointer select-none ${
                  dragging
                    ? "border-corgan-gold bg-corgan-gold/5 scale-[1.01]"
                    : "border-gray-300 bg-white hover:border-corgan-gold/60"
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => fileRef.current?.click()}
              >
                <div className="text-7xl mb-5 select-none">🏠</div>
                <h2 className="text-xl font-semibold text-gray-700 mb-1">Upload a Room Photo</h2>
                <p className="text-gray-400 text-sm text-center mb-6 max-w-xs">
                  Drag &amp; drop, browse files, or take a photo with your camera
                </p>
                <div className="flex gap-3">
                  <button
                    className="px-5 py-2.5 bg-corgan-navy text-white text-sm font-semibold rounded-xl hover:bg-corgan-navy-dark transition-colors shadow-sm"
                    onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
                  >
                    Browse Files
                  </button>
                  <button
                    className="px-5 py-2.5 border-2 border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:border-corgan-gold hover:text-corgan-navy transition-colors"
                    onClick={(e) => { e.stopPropagation(); cameraRef.current?.click(); }}
                  >
                    📷 Camera
                  </button>
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
                <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onFile} />
              </div>
            )}

            {/* Image display */}
            {imageLoaded && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                {/* Tabs */}
                <div className="flex border-b border-gray-100">
                  <button
                    onClick={() => setView("original")}
                    className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                      view === "original"
                        ? "text-corgan-navy border-b-2 border-corgan-navy bg-gray-50/50"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    Original Photo
                  </button>
                  <button
                    onClick={() => setView("generated")}
                    disabled={!generatedUrl}
                    className={`flex-1 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed ${
                      view === "generated"
                        ? "text-corgan-gold border-b-2 border-corgan-gold bg-corgan-gold/5"
                        : generatedUrl
                        ? "text-gray-400 hover:text-gray-600"
                        : "text-gray-200"
                    }`}
                  >
                    ✨ AI Visualisation
                    {generatedUrl && (
                      <span className="ml-2 inline-block w-2 h-2 rounded-full bg-corgan-teal" />
                    )}
                  </button>
                </div>

                {/* Image */}
                <div className="relative min-h-[300px] bg-gray-50 flex items-center justify-center">
                  {generating && (
                    <div className="absolute inset-0 bg-corgan-navy/80 flex flex-col items-center justify-center z-10 rounded-b-none">
                      <svg className="animate-spin h-10 w-10 text-corgan-gold mb-4" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
                      </svg>
                      <p className="text-white font-semibold text-base">{LOADING_MESSAGES[loadingMsg]}</p>
                      <p className="text-corgan-navy-light text-xs mt-2">This usually takes 20–40 seconds</p>
                    </div>
                  )}

                  {view === "original" && originalUrl && (
                    <img
                      src={originalUrl}
                      alt="Original room"
                      className="w-full h-auto block"
                      style={{ maxHeight: "65vh", objectFit: "contain" }}
                    />
                  )}

                  {view === "generated" && generatedUrl && (
                    <img
                      src={generatedUrl}
                      alt="AI-generated room with new colour"
                      className="w-full h-auto block"
                      style={{ maxHeight: "65vh", objectFit: "contain" }}
                    />
                  )}

                  {view === "generated" && !generatedUrl && !generating && (
                    <div className="py-20 text-center text-gray-400">
                      <p className="text-4xl mb-3">🎨</p>
                      <p className="text-sm font-medium">Select a colour and click<br /><strong className="text-corgan-gold">Paint My Room</strong> to generate</p>
                    </div>
                  )}
                </div>

                {/* Colour chip overlay on generated image */}
                {view === "generated" && generatedUrl && (
                  <div className="px-4 py-2 bg-corgan-gold/10 border-t border-corgan-gold/20 flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded border border-black/10 shadow-sm flex-shrink-0"
                      style={{ backgroundColor: activeColor.hex }}
                    />
                    <p className="text-xs font-medium text-corgan-navy">
                      Painted in <strong>{activeColor.name}</strong>{" "}
                      <span className="font-mono text-gray-500">{activeColor.hex.toUpperCase()}</span>
                    </p>
                  </div>
                )}

                {/* Toolbar */}
                <div className="px-4 py-3 border-t border-gray-100 flex flex-wrap items-center gap-2">
                  <button
                    onClick={newPhoto}
                    className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    📂 New Photo
                  </button>
                  <div className="flex-1" />
                  <button
                    onClick={download}
                    className="px-4 py-1.5 text-xs font-semibold bg-corgan-navy text-white rounded-lg hover:bg-corgan-navy-dark transition-colors shadow-sm"
                  >
                    ⬇ Download {view === "generated" && generatedUrl ? "Result" : "Original"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Right: controls ── */}
          <div className="flex flex-col gap-4">

            {/* Step 1 — Analyse */}
            {imageLoaded && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-5 h-5 rounded-full bg-corgan-navy text-white text-xs font-bold flex items-center justify-center flex-shrink-0">1</span>
                  <h3 className="font-bold text-corgan-navy text-sm tracking-wide uppercase">Analyse Room</h3>
                </div>
                <p className="text-xs text-gray-500 mb-4 ml-7">GPT-4o reads your photo and suggests colours that suit your space.</p>
                <button
                  onClick={analyze}
                  disabled={analyzing}
                  className="w-full py-2.5 bg-corgan-navy text-white font-bold text-sm rounded-xl hover:bg-corgan-navy-dark transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {analyzing ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
                      </svg>
                      Analysing…
                    </>
                  ) : (
                    "✦ Get AI Colour Suggestions"
                  )}
                </button>
                {analyzeError && (
                  <p className="mt-2 text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{analyzeError}</p>
                )}
              </div>
            )}

            {/* Step 2 — Pick colour */}
            {imageLoaded && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-5 h-5 rounded-full bg-corgan-navy text-white text-xs font-bold flex items-center justify-center flex-shrink-0">2</span>
                  <h3 className="font-bold text-corgan-navy text-sm tracking-wide uppercase">Choose Colour</h3>
                </div>

                {/* AI swatches */}
                {recs.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {recs.map((rec, i) => (
                      <button
                        key={i}
                        onClick={() => { setSelectedIdx(i); setUsingCustom(false); }}
                        className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                          !usingCustom && selectedIdx === i
                            ? "border-corgan-gold bg-corgan-gold/5 shadow-sm"
                            : "border-gray-100 hover:border-gray-200 bg-gray-50/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex-shrink-0 border border-black/10 shadow-sm"
                            style={{ backgroundColor: rec.hex }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm text-gray-800">{rec.name}</span>
                              <span className="font-mono text-xs text-gray-400">{rec.hex.toUpperCase()}</span>
                            </div>
                            <p className="text-xs text-gray-500 truncate">{rec.brand}</p>
                            <p className="text-xs font-medium text-corgan-teal">{rec.mood}</p>
                          </div>
                          {!usingCustom && selectedIdx === i && (
                            <div className="w-5 h-5 rounded-full bg-corgan-gold flex items-center justify-center flex-shrink-0">
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                        {!usingCustom && selectedIdx === i && (
                          <p className="mt-2 text-xs text-gray-600 leading-relaxed border-t border-corgan-gold/20 pt-2">
                            {rec.reason}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Custom colour picker */}
                <div
                  onClick={() => setUsingCustom(true)}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    usingCustom
                      ? "border-corgan-gold bg-corgan-gold/5 shadow-sm"
                      : "border-gray-100 hover:border-gray-200 bg-gray-50/50"
                  }`}
                >
                  <input
                    type="color"
                    value={customHex}
                    onChange={(e) => { setCustomHex(e.target.value); setUsingCustom(true); setSelectedIdx(null); }}
                    className="w-10 h-10 rounded-lg cursor-pointer border-2 border-gray-200"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700">Custom Colour</p>
                    <p className="text-xs font-mono text-gray-500">{customHex.toUpperCase()}</p>
                  </div>
                  {usingCustom && (
                    <div className="w-5 h-5 rounded-full bg-corgan-gold flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3 — Generate */}
            {imageLoaded && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-5 h-5 rounded-full bg-corgan-navy text-white text-xs font-bold flex items-center justify-center flex-shrink-0">3</span>
                  <h3 className="font-bold text-corgan-navy text-sm tracking-wide uppercase">Paint My Room</h3>
                </div>

                {/* Selected colour preview */}
                <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-xl">
                  <div
                    className="w-10 h-10 rounded-lg border border-black/10 shadow-sm flex-shrink-0"
                    style={{ backgroundColor: activeColor.hex }}
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">{activeColor.name}</p>
                    <p className="text-xs font-mono text-gray-500">{activeColor.hex.toUpperCase()}</p>
                  </div>
                </div>

                {/* Quality selector */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Quality</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(["low", "medium"] as const).map((q) => {
                      const cost = { low: "$0.011", medium: "$0.042" }[q];
                      return (
                        <button
                          key={q}
                          onClick={() => setQuality(q)}
                          className={`py-2 px-1 rounded-lg border-2 text-center transition-all ${
                            quality === q
                              ? "border-corgan-gold bg-corgan-gold/5"
                              : "border-gray-100 hover:border-gray-200 bg-gray-50"
                          }`}
                        >
                          <p className="text-xs font-semibold capitalize text-gray-700">{q}</p>
                          <p className="text-xs font-mono text-gray-400">{cost}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={paint}
                  disabled={generating}
                  className="w-full py-3 bg-corgan-gold text-white font-bold text-sm rounded-xl hover:bg-corgan-gold-dark transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {generating ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
                      </svg>
                      Generating…
                    </>
                  ) : (
                    "🎨 Paint My Room"
                  )}
                </button>

                {paintError && (
                  <p className="mt-2 text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{paintError}</p>
                )}

                <p className="mt-3 text-xs text-center text-gray-400">
                  Powered by GPT Image 1 · takes ~20–40 seconds
                </p>
              </div>
            )}

            {/* Getting started (before upload) */}
            {!imageLoaded && (
              <div className="bg-corgan-navy rounded-2xl p-5 text-white">
                <h3 className="font-bold mb-2 text-sm tracking-wide uppercase text-corgan-gold">How It Works</h3>
                <ol className="text-xs leading-relaxed text-corgan-navy-light space-y-2 list-decimal list-inside">
                  <li>Upload a photo of your room</li>
                  <li>GPT-4o suggests the perfect paint colours</li>
                  <li>Pick a colour — or choose your own</li>
                  <li>AI repaints the room and returns a photorealistic preview</li>
                  <li>Download and share with your client</li>
                </ol>
                <div className="mt-4">
                  <BrandStripe />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-auto border-t border-gray-200 py-5 text-center">
        <p className="text-xs text-gray-400">
          © 2026 Corgan Enterprises Ltd. · Fort McMurray, AB · (587)&nbsp;275‑9376 ·{" "}
          <a href="mailto:admin@corgan.ca" className="hover:text-corgan-gold transition-colors">
            admin@corgan.ca
          </a>
        </p>
      </footer>
    </div>
  );
}
