import { useState, useEffect, FormEvent } from "react";
import {
  Sparkles,
  Moon,
  Sun,
  Heart,
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  Info,
  Shield,
  RefreshCw,
  BookOpen,
  ChevronRight,
  UserCheck
} from "lucide-react";
import VedicProfileForm from "./components/VedicProfileForm";
import { DailyHoroscope, MoonPhaseInfo, CompatibilityInput, CompatibilityResult } from "./types";

const RASHIS = [
  { key: "Mesh", en: "Aries", symbol: "♈", element: "Fire" },
  { key: "Vrishabh", en: "Taurus", symbol: "♉", element: "Earth" },
  { key: "Mithun", en: "Gemini", symbol: "♊", element: "Air" },
  { key: "Kark", en: "Cancer", symbol: "♋", element: "Water" },
  { key: "Simha", en: "Leo", symbol: "♌", element: "Fire" },
  { key: "Kanya", en: "Virgo", symbol: "♍", element: "Earth" },
  { key: "Tula", en: "Libra", symbol: "♎", element: "Air" },
  { key: "Vrishchik", en: "Scorpio", symbol: "♏", element: "Water" },
  { key: "Dhanu", en: "Sagittarius", symbol: "♐", element: "Fire" },
  { key: "Makar", en: "Capricorn", symbol: "♑", element: "Earth" },
  { key: "Kumbha", en: "Aquarius", symbol: "♒", element: "Air" },
  { key: "Meen", en: "Pisces", symbol: "♓", element: "Water" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<"rashifal" | "panchang" | "milan" | "kundli">("rashifal");

  // Rashifal States
  const [selectedRashi, setSelectedRashi] = useState("Mesh");
  const [horoscope, setHoroscope] = useState<DailyHoroscope | null>(null);
  const [rashiLoading, setRashiLoading] = useState(false);

  // Panchang / Moon States
  const [moonDate, setMoonDate] = useState("2026-05-27");
  const [moonInfo, setMoonInfo] = useState<MoonPhaseInfo | null>(null);
  const [moonLoading, setMoonLoading] = useState(false);

  // Milan Compatibility States
  const [compInput, setCompInput] = useState<CompatibilityInput>({
    partnerA: { name: "", birthDate: "1998-06-15", birthTime: "08:30", birthPlace: "Mumbai" },
    partnerB: { name: "", birthDate: "1999-07-20", birthTime: "14:15", birthPlace: "Delhi" }
  });
  const [compResult, setCompResult] = useState<CompatibilityResult | null>(null);
  const [compLoading, setCompLoading] = useState(false);

  // ----------------------------------------------------
  // EFFECT HOOKS FOR AUTO FETCHING
  // ----------------------------------------------------

  // Fetch Horoscope when Rashi selection changes
  useEffect(() => {
    fetchHoroscope();
  }, [selectedRashi]);

  // Fetch Moon details when calendar date changes
  useEffect(() => {
    fetchMoonDetails();
  }, [moonDate]);

  const fetchHoroscope = async () => {
    setRashiLoading(true);
    try {
      const res = await fetch("/api/daily-horoscope", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rashi: selectedRashi })
      });
      if (res.ok) {
        const data = await res.json();
        setHoroscope(data);
      }
    } catch (e) {
      console.error("Error loading horoscope", e);
    } finally {
      setRashiLoading(false);
    }
  };

  const fetchMoonDetails = async () => {
    setMoonLoading(true);
    try {
      const res = await fetch("/api/moon-phase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: moonDate })
      });
      if (res.ok) {
        const data = await res.json();
        setMoonInfo(data);
      }
    } catch (e) {
      console.error("Error loading moon details", e);
    } finally {
      setMoonLoading(false);
    }
  };

  const handleCompatibilitySubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!compInput.partnerA.name.trim() || !compInput.partnerB.name.trim()) return;

    setCompLoading(true);
    try {
      const res = await fetch("/api/compatibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(compInput)
      });
      if (res.ok) {
        const data = await res.json();
        setCompResult(data);
      }
    } catch (e) {
      console.error("Error loading compatibility analysis", e);
    } finally {
      setCompLoading(false);
    }
  };

  // Helper to render dynamic Moon SVG representing Phase and Illumination
  const renderMoonSvg = (illumination: number, phaseName: string) => {
    const isWaning = phaseName.toLowerCase().includes("waning") || phaseName.toLowerCase().includes("third");
    // Standard drawing parameters
    const size = 120;
    const radius = 50;
    const center = size / 2;

    // Build paths representing dynamic shadowed crescent or gibbous shapes
    let pathString = "";
    const k = illumination / 100;

    if (illumination === 0) {
      // New Moon: fully shadowed
      pathString = `M ${center - radius} ${center} A ${radius} ${radius} 0 1 0 ${center + radius} ${center} A ${radius} ${radius} 0 1 0 ${center - radius} ${center}`;
    } else if (illumination === 100) {
      // Full Moon: fully illuminated (drawn as space)
      pathString = "";
    } else if (illumination < 50) {
      // Crescent Moon
      const rx = radius * (1 - 2 * k);
      const sweepFlag = isWaning ? 1 : 0;
      pathString = `M ${center} ${center - radius} 
                    A ${radius} ${radius} 0 0 1 ${center} ${center + radius} 
                    A ${rx} ${radius} 0 0 ${sweepFlag} ${center} ${center - radius} Z`;
    } else {
      // Gibbous Moon
      const rx = radius * (2 * k - 1);
      const sweepFlag = isWaning ? 0 : 1;
      pathString = `M ${center} ${center - radius} 
                    A ${radius} ${radius} 0 0 1 ${center} ${center + radius} 
                    A ${rx} ${radius} 0 0 ${sweepFlag} ${center} ${center - radius} Z`;
    }

    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto select-none">
        {/* Full illuminated base background (Lunar surface color) */}
        <circle cx={center} cy={center} r={radius} fill="#FFFBF2" stroke="#D4AF37" strokeWidth="1" />
        
        {/* Shadowed layer overlay */}
        {illumination < 100 && (
          <path
            d={pathString || `M ${center - radius} ${center} A ${radius} ${radius} 0 1 0 ${center + radius} ${center} Z`}
            fill="#1E1E24"
            opacity="0.94"
          />
        )}
        
        {/* Delicate surrounding orbit border */}
        <circle cx={center} cy={center} r={radius + 6} fill="none" stroke="#1A1A1A" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.3" />
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col p-4 md:p-10 text-[#1A1A1A] font-serif selection:bg-[#D4AF37]/20 relative">
      
      {/* Decorative Outer Lines (Editorial Frame) */}
      <div className="absolute top-10 left-10 right-10 bottom-10 border border-[#1A1A1A]/5 pointer-events-none hidden md:block" />

      <div className="max-w-7xl mx-auto w-full z-10 flex-1 flex flex-col space-y-10 relative">
        
        {/* HEADER SECTION */}
        <header className="flex flex-col md:flex-row md:justify-between md:items-end border-b border-[#1A1A1A] pb-6 gap-6 md:gap-0">
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-[0.25em] font-sans font-bold text-[#8B4513] mb-1">
              Jyotish Wisdom • Sidereal Alignments
            </span>
            <h1 className="text-4xl md:text-5xl font-light italic tracking-tight text-[#1A1A1A] select-none">
              Soma & Surya
            </h1>
          </div>
          
          {/* Top Editorial style Navigation */}
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-xs uppercase tracking-[0.2em] font-sans font-bold">
            <button
              onClick={() => setActiveTab("rashifal")}
              className={`pb-1 transition-all ${
                activeTab === "rashifal"
                  ? "border-b border-[#1A1A1A] text-[#1A1A1A]"
                  : "text-slate-400 hover:text-[#1A1A1A]"
              }`}
            >
              Rashifal (Horoscopes)
            </button>
            <button
              onClick={() => setActiveTab("panchang")}
              className={`pb-1 transition-all ${
                activeTab === "panchang"
                  ? "border-b border-[#1A1A1A] text-[#1A1A1A]"
                  : "text-slate-400 hover:text-[#1A1A1A]"
              }`}
            >
              Lunar Station (Panchang)
            </button>
            <button
              onClick={() => setActiveTab("milan")}
              className={`pb-1 transition-all ${
                activeTab === "milan"
                  ? "border-b border-[#1A1A1A] text-[#1A1A1A]"
                  : "text-slate-400 hover:text-[#1A1A1A]"
              }`}
            >
              Milan Compatibility
            </button>
            <button
              onClick={() => setActiveTab("kundli")}
              className={`pb-1 transition-all ${
                activeTab === "kundli"
                  ? "border-b border-[#1A1A1A] text-[#1A1A1A]"
                  : "text-slate-400 hover:text-[#1A1A1A]"
              }`}
            >
              Kundli Blueprint
            </button>
          </nav>
        </header>

        {/* MAIN BODY LAYOUT */}
        <main className="flex-1">

          {/* TAB 1: DAILY RASHIFAL (HOROSCOPE) */}
          {activeTab === "rashifal" && (
            <div id="rashifal_view" className="space-y-10 animate-fade-in">
              
              {/* Introduction bar */}
              <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#1A1A1A]/10 pb-6 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-[0.25em] font-sans font-semibold text-[#8B4513] block">
                    Daily Sidereal Forecasts
                  </span>
                  <h2 className="text-3xl font-serif font-light text-[#1A1A1A]">
                    Select Your Chandra Rashi (Moon Sign)
                  </h2>
                  <p className="text-xs text-slate-500 font-sans max-w-xl">
                    Vedic horoscopes are read primarily from Chandra Rashi (placement of the moon at birth) to capture precise, emotional, and structural karmic transits.
                  </p>
                </div>

                {/* Quick select Rashi picker */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-sans font-bold tracking-widest text-slate-400">Rashi:</span>
                  <select
                    value={selectedRashi}
                    onChange={(e) => setSelectedRashi(e.target.value)}
                    className="bg-white border border-[#1A1A1A]/15 py-1.5 px-3 uppercase tracking-wider text-xs font-sans font-bold focus:border-[#1A1A1A] outline-none"
                  >
                    {RASHIS.map((r) => (
                      <option key={r.key} value={r.key}>
                        {r.symbol} {r.key} ({r.en})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Rashi grid list as side column and active horoscope display in center */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* Left Column: 12 Rashi Grid Selector (Editorial Sidelist) */}
                <div className="lg:col-span-3 flex flex-col border-r border-[#1A1A1A]/10 pr-6 space-y-6">
                  <div>
                    <h3 className="text-xs uppercase tracking-widest font-sans font-bold text-[#D4AF37] mb-4">
                      The Twelve Houses (Grahas)
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      {RASHIS.map((r) => (
                        <button
                          key={r.key}
                          onClick={() => setSelectedRashi(r.key)}
                          className={`p-3 border text-center transition-all duration-300 ${
                            selectedRashi === r.key
                              ? "bg-[#1A1A1A] text-[#FDFBF7] border-[#1A1A1A]"
                              : "bg-white border-[#1A1A1A]/10 hover:border-[#1A1A1A]/30 text-slate-700"
                          }`}
                        >
                          <span className="text-lg block mb-1">{r.symbol}</span>
                          <span className="text-[10px] font-sans font-extrabold uppercase tracking-tight block truncate">
                            {r.key}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Aesthetic editorial quote */}
                  <div className="mt-8 bg-[#1A1A1A]/[0.02] border border-[#1A1A1A]/5 p-4 italic text-xs text-slate-500 leading-relaxed font-serif">
                    "The stars are the handwriting of the divine. By interpreting their sidereal rhythms, we honor our personal path (Dharma) and embrace seasonal alignments."
                  </div>
                </div>

                {/* Center & Right Columns: Selected Horoscopes */}
                <div className="lg:col-span-9 space-y-8">
                  {rashiLoading ? (
                    <div className="h-64 flex flex-col items-center justify-center space-y-3">
                      <RefreshCw className="w-8 h-8 text-slate-300 animate-spin" />
                      <p className="text-sm font-sans text-slate-500">Retrieving transit houses from the cosmos...</p>
                    </div>
                  ) : horoscope ? (
                    <div className="space-y-8">
                      {/* Hero Section */}
                      <div className="relative border-b border-[#1A1A1A]/10 pb-6">
                        <span className="absolute -top-6 -left-4 text-9xl opacity-10 font-bold font-sans selection:bg-transparent pointer-events-none">
                          {RASHIS.findIndex((r) => r.key === selectedRashi) + 1 < 10
                            ? `0${RASHIS.findIndex((r) => r.key === selectedRashi) + 1}`
                            : RASHIS.findIndex((r) => r.key === selectedRashi) + 1}
                        </span>
                        
                        <div className="relative z-10 flex flex-wrap justify-between items-baseline gap-2">
                          <div>
                            <h2 className="text-5xl md:text-6xl font-serif text-[#1A1A1A] font-bold tracking-tighter">
                              {horoscope.rashi}
                            </h2>
                            <p className="text-md italic text-[#8B4513] font-serif font-medium">
                              The {horoscope.englishName} • Daily Sidereal Readings
                            </p>
                          </div>
                          
                          <div className="flex gap-4 font-mono text-[11px] text-slate-500 mt-2">
                            <span>TRANSIT: 2026-05-27</span>
                            <span>•</span>
                            <span>ASTRO SYSTEM: SIDEREAL (VEDIC)</span>
                          </div>
                        </div>
                      </div>

                      {/* Reading Blocks */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                        
                        {/* Summary Block */}
                        <div className="md:col-span-8 space-y-6">
                          <div className="space-y-3 bg-[#FDFBF7] p-5 border border-[#1A1A1A]/10">
                            <span className="text-[10px] uppercase font-sans font-bold tracking-widest text-[#D4AF37] block">
                              Cosmic Forecast
                            </span>
                            <p className="text-lg leading-relaxed text-[#1A1A1A] font-serif">
                              {horoscope.general}
                            </p>
                          </div>

                          {/* Specific sectors */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            
                            {/* Career */}
                            <div className="border border-[#1A1A1A]/10 p-5 bg-white space-y-2">
                              <span className="text-[10px] uppercase font-sans font-bold tracking-widest text-[#8B4513] block">
                                💼 Karma & Career
                              </span>
                              <p className="text-xs text-slate-600 leading-relaxed">
                                {horoscope.career}
                              </p>
                            </div>

                            {/* Finance */}
                            <div className="border border-[#1A1A1A]/10 p-5 bg-white space-y-2">
                              <span className="text-[10px] uppercase font-sans font-bold tracking-widest text-[#8B4513] block">
                                🪙 Artha & Finance
                              </span>
                              <p className="text-xs text-slate-600 leading-relaxed">
                                {horoscope.finance}
                              </p>
                            </div>

                            {/* Love / Relationship */}
                            <div className="border border-[#1A1A1A]/10 p-5 bg-white space-y-2">
                              <span className="text-[10px] uppercase font-sans font-bold tracking-widest text-pink-700 block">
                                💖 Kama & Relations
                              </span>
                              <p className="text-xs text-slate-600 leading-relaxed">
                                {horoscope.love}
                              </p>
                            </div>

                            {/* Health */}
                            <div className="border border-[#1A1A1A]/10 p-5 bg-white space-y-2">
                              <span className="text-[10px] uppercase font-sans font-bold tracking-widest text-teal-700 block">
                                🧘 Health & Ayurveda
                              </span>
                              <p className="text-xs text-slate-600 leading-relaxed">
                                {horoscope.health}
                              </p>
                            </div>

                          </div>
                        </div>

                        {/* Right Stats Sidebar (Editorial Numbers) */}
                        <div className="md:col-span-4 bg-white border border-[#1A1A1A]/10 p-6 space-y-6">
                          
                          {/* Energy Meter */}
                          <div className="space-y-2 pb-4 border-b border-[#1A1A1A]/10">
                            <span className="text-[9px] uppercase font-sans font-bold tracking-wider text-slate-400 block">
                              Prana Energy Level
                            </span>
                            <div className="flex justify-between items-end">
                              <span className="text-xs font-sans text-slate-600">Vitality Force</span>
                              <span className="text-2xl font-serif italic text-[#1A1A1A] font-semibold">{horoscope.energyLevel}%</span>
                            </div>
                            <div className="w-full h-1 bg-slate-100 rounded-none overflow-hidden relative">
                              <div
                                className="bg-[#D4AF37] h-full absolute transition-all duration-1000"
                                style={{ width: `${horoscope.energyLevel}%` }}
                              />
                            </div>
                          </div>

                          {/* Lucky Attributes */}
                          <div className="space-y-4 pb-4 border-b border-[#1A1A1A]/10 text-xs font-sans">
                            <span className="text-[9px] uppercase font-sans font-bold tracking-wider text-slate-400 block">
                              Auspicious Alignments
                            </span>
                            
                            <div className="flex justify-between py-1 border-b border-dashed border-slate-100">
                              <span className="text-slate-500">Lucky Number</span>
                              <strong className="text-sm font-serif italic text-[#1A1A1A]">{horoscope.luckyNumber}</strong>
                            </div>

                            <div className="flex justify-between py-1 border-b border-dashed border-slate-100">
                              <span className="text-slate-500">Lucky Color</span>
                              <strong className="text-slate-700 uppercase tracking-wider text-[10px] font-bold">
                                {horoscope.luckyColor}
                              </strong>
                            </div>

                            <div className="flex justify-between py-1">
                              <span className="text-slate-500">Auspicious Hora</span>
                              <strong className="text-slate-600 text-[10px]">{horoscope.luckyTime}</strong>
                            </div>
                          </div>

                          {/* Daily Remedy */}
                          <div className="space-y-3 pt-2">
                            <span className="text-[9px] uppercase font-sans font-bold tracking-widest text-[#8B4513] block">
                              Prescribed Upaya (Remedy)
                            </span>
                            <p className="text-xs text-slate-600 leading-relaxed italic bg-amber-50/30 p-3 border border-[#D4AF37]/15">
                              {horoscope.remedy}
                            </p>
                          </div>

                        </div>

                      </div>
                    </div>
                  ) : (
                    <div className="h-64 border border-dashed border-slate-250 flex items-center justify-center">
                      <p className="text-sm text-slate-400">Failed to render horoscope forecast.</p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: LUNAR STATION (TITHI & MOON TRACKER) */}
          {activeTab === "panchang" && (
            <div id="panchang_view" className="space-y-10 animate-fade-in">
              
              <div className="border-b border-[#1A1A1A] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-[0.25em] font-sans font-semibold text-[#8B4513] block">
                    Lunar Astronomy & Panchang
                  </span>
                  <h2 className="text-3xl md:text-4xl font-serif font-light text-[#1A1A1A]">
                    Live Tithi & Moon Phase tracker
                  </h2>
                  <p className="text-sm text-slate-600 max-w-2xl font-sans mt-2">
                    In Indian lore, the Moon (Soma / Chandra) drives the mental tides (Manas). Track daily lunar age, synodic distance, and find corresponding astrological tithis with custom rituals.
                  </p>
                </div>

                {/* Calendar Input to select date */}
                <div className="flex items-center gap-3 bg-white border border-[#1A1A1A]/10 p-2 text-xs font-sans">
                  <span className="font-bold text-[#8B4513] uppercase tracking-wider">Select Date:</span>
                  <input
                    type="date"
                    value={moonDate}
                    onChange={(e) => setMoonDate(e.target.value)}
                    className="outline-none focus:text-[#1A1A1A] font-mono font-bold text-slate-700"
                  />
                </div>
              </div>

              {moonLoading ? (
                <div className="h-64 flex flex-col items-center justify-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-slate-300 animate-spin" />
                  <p className="text-sm font-sans text-slate-500">Mapping daily lunar coordinates...</p>
                </div>
              ) : moonInfo ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  
                  {/* Column 1: Lunar Drawing */}
                  <div className="lg:col-span-4 flex flex-col border-r border-[#1A1A1A]/10 pr-8 items-center text-center">
                    <div className="w-full bg-white border border-[#1A1A1A]/10 p-8 space-y-6 flex flex-col justify-center h-full">
                      <span className="text-[10px] uppercase tracking-widest font-sans font-extrabold text-[#D4AF37] block">
                        Lunar Station Representation
                      </span>
                      
                      <div className="my-3">
                        {renderMoonSvg(moonInfo.illumination, moonInfo.phaseName)}
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-2xl font-serif italic text-[#1A1A1A] font-semibold">{moonInfo.phaseName}</h3>
                        <p className="text-xs uppercase tracking-widest font-sans font-bold text-slate-500">
                          {moonInfo.tithiType} • Tithi #{moonInfo.tithiNum}
                        </p>
                      </div>

                      <div className="border-t border-[#1A1A1A]/10 pt-4 flex justify-around text-xs font-sans text-slate-600">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Illumination</span>
                          <strong className="text-sm font-serif text-[#1A1A1A] font-bold">{moonInfo.illumination}%</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Lunar Age</span>
                          <strong className="text-sm font-serif text-[#1A1A1A] font-bold">{moonInfo.age} days</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Tithi & Detail analysis */}
                  <div className="lg:col-span-8 space-y-6">
                    <div className="bg-white border border-[#1A1A1A]/10 p-6 md:p-8 space-y-6">
                      <div className="border-b border-[#1A1A1A]/10 pb-4">
                        <span className="text-[10px] uppercase tracking-wider font-sans font-bold text-[#8B4513]">Lunar Phase Details</span>
                        <h3 className="text-3xl font-serif text-[#1A1A1A] mt-1 italic">
                          Tithi: {moonInfo.tithiName}
                        </h3>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-xs uppercase tracking-widest font-sans font-extrabold text-[#D4AF37]">
                          Spiritual Significance & Recommended Rituals (Dwitiya)
                        </h4>
                        <p className="text-sm text-slate-700 leading-relaxed font-sans text-justify">
                          {moonInfo.tithiSignificance}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-[#1A1A1A]/10 pt-6">
                        <div className="space-y-1 font-sans">
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest block">Approximated Distance</span>
                          <p className="text-base font-serif font-bold text-[#1A1A1A]">
                            {moonInfo.distance.toLocaleString()} km
                          </p>
                          <span className="text-[9px] text-slate-400 block">True Distance to Earth's center</span>
                        </div>

                        <div className="space-y-1 font-sans">
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest block">Geocentered Target</span>
                          <p className="text-base font-serif font-bold text-[#1A1A1A]">
                            {moonInfo.date}
                          </p>
                          <span className="text-[9px] text-slate-400 block">Western calendar date system</span>
                        </div>
                      </div>
                    </div>

                    {/* Next events calendars */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      
                      {/* Full Moon */}
                      <div className="bg-[#1A1A1A] text-white p-6 justify-between flex flex-col space-y-4">
                        <div className="space-y-1">
                          <span className="text-[9px] uppercase tracking-widest font-sans font-bold text-[#D4AF37] block">
                            Peak Celestial Force
                          </span>
                          <h4 className="text-xl font-serif italic text-white">Next Full Moon (Purnima)</h4>
                        </div>
                        <div className="flex justify-between items-baseline border-t border-white/10 pt-4">
                          <span className="text-sm font-sans text-slate-300">Lunar Ascent</span>
                          <strong className="text-lg font-serif font-semibold text-[#D4AF37]">
                            {moonInfo.nextPurnima}
                          </strong>
                        </div>
                      </div>

                      {/* New Moon */}
                      <div className="bg-[#FBFAF4] border border-[#1A1A1A]/10 p-6 justify-between flex flex-col space-y-4">
                        <div className="space-y-1">
                          <span className="text-[9px] uppercase tracking-widest font-sans font-bold text-[#8B4513] block">
                            Celestial Null Orbit
                          </span>
                          <h4 className="text-xl font-serif italic text-[#1A1A1A]">Next New Moon (Amavasya)</h4>
                        </div>
                        <div className="flex justify-between items-baseline border-t border-[#1A1A1A]/10 pt-4">
                          <span className="text-sm font-sans text-slate-500">Lunar Descent</span>
                          <strong className="text-lg font-serif font-semibold text-[#8B4513]">
                            {moonInfo.nextAmavasya}
                          </strong>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>
              ) : (
                <div className="h-64 border border-dashed border-slate-250 flex items-center justify-center">
                  <p className="text-sm text-slate-400">Failed to render lunar station metrics.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MILAN COMPATIBILITY (GUN MILAN) */}
          {activeTab === "milan" && (
            <div id="milan_view" className="space-y-10 animate-fade-in">
              
              <div className="border-b border-[#1A1A1A] pb-6">
                <span className="text-[10px] uppercase tracking-[0.25em] font-sans font-semibold text-[#8B4513] block mb-1">
                  Vedic Matrimony Synastry (Gun Milan)
                </span>
                <h2 className="text-3xl md:text-4xl font-serif font-light text-[#1A1A1A]">
                  Astrological Relationship Matching
                </h2>
                <p className="text-sm text-slate-600 mt-2 max-w-3xl font-sans leading-relaxed">
                  The Ashta Koota system measures compatibility out of 36 spiritual matching points (Gun match). By matching Moon Signs and Nakshatras between couples, it predicts mental friendship, physical compatibility, lifecycle harmony, and spiritual alignment.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                
                {/* Inputs Columns */}
                <div className="lg:col-span-5 bg-white border border-[#1A1A1A]/10 p-6 md:p-8 space-y-6">
                  <div className="flex items-center gap-3 border-b border-[#1A1A1A]/10 pb-4">
                    <Heart className="w-4 h-4 text-pink-700" />
                    <h3 className="font-serif text-lg tracking-wide uppercase font-semibold text-[#1A1A1A]">Partners Register</h3>
                  </div>

                  <form onSubmit={handleCompatibilitySubmit} className="space-y-8">
                    
                    {/* Partner A (Soma) */}
                    <div className="space-y-4">
                      <h4 className="text-xs uppercase font-sans font-extrabold text-[#8B4513] border-b border-[#1A1A1A]/10 pb-1">
                        First Partner (Yin / Soma)
                      </h4>
                      
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-sans font-bold uppercase text-slate-400">First Partner Name</label>
                          <input
                            type="text"
                            placeholder="Enter Name"
                            value={compInput.partnerA.name}
                            onChange={(e) => setCompInput({
                              ...compInput,
                              partnerA: { ...compInput.partnerA, name: e.target.value }
                            })}
                            className="editorial-input"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-sans font-bold uppercase text-slate-400">Birth Date</label>
                            <input
                              type="date"
                              value={compInput.partnerA.birthDate}
                              onChange={(e) => setCompInput({
                                ...compInput,
                                partnerA: { ...compInput.partnerA, birthDate: e.target.value }
                              })}
                              className="editorial-input"
                              required
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-sans font-bold uppercase text-slate-400">Birth Time</label>
                            <input
                              type="time"
                              value={compInput.partnerA.birthTime}
                              onChange={(e) => setCompInput({
                                ...compInput,
                                partnerA: { ...compInput.partnerA, birthTime: e.target.value }
                              })}
                              className="editorial-input"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-sans font-bold uppercase text-slate-400">Place of Birth</label>
                          <input
                            type="text"
                            placeholder="City, Country"
                            value={compInput.partnerA.birthPlace}
                            onChange={(e) => setCompInput({
                              ...compInput,
                              partnerA: { ...compInput.partnerA, birthPlace: e.target.value }
                            })}
                            className="editorial-input"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Partner B (Surya) */}
                    <div className="space-y-4">
                      <h4 className="text-xs uppercase font-sans font-extrabold text-[#8B4513] border-b border-[#1A1A1A]/10 pb-1">
                        Second Partner (Yang / Surya)
                      </h4>
                      
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-sans font-bold uppercase text-slate-400">Second Partner Name</label>
                          <input
                            type="text"
                            placeholder="Enter Name"
                            value={compInput.partnerB.name}
                            onChange={(e) => setCompInput({
                              ...compInput,
                              partnerB: { ...compInput.partnerB, name: e.target.value }
                            })}
                            className="editorial-input"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-sans font-bold uppercase text-slate-400">Birth Date</label>
                            <input
                              type="date"
                              value={compInput.partnerB.birthDate}
                              onChange={(e) => setCompInput({
                                ...compInput,
                                partnerB: { ...compInput.partnerB, birthDate: e.target.value }
                              })}
                              className="editorial-input"
                              required
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-sans font-bold uppercase text-slate-400">Birth Time</label>
                            <input
                              type="time"
                              value={compInput.partnerB.birthTime}
                              onChange={(e) => setCompInput({
                                ...compInput,
                                partnerB: { ...compInput.partnerB, birthTime: e.target.value }
                              })}
                              className="editorial-input"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-sans font-bold uppercase text-slate-400">Place of Birth</label>
                          <input
                            type="text"
                            placeholder="City, Country"
                            value={compInput.partnerB.birthPlace}
                            onChange={(e) => setCompInput({
                              ...compInput,
                              partnerB: { ...compInput.partnerB, birthPlace: e.target.value }
                            })}
                            className="editorial-input"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      id="match_compatibility_btn"
                      type="submit"
                      disabled={compLoading}
                      className="w-full ink-btn-primary"
                    >
                      {compLoading ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin text-white" />
                          <span>SYNCHRONISING KUNDLIS...</span>
                        </>
                      ) : (
                        <>
                          <Heart className="w-3.5 h-3.5" />
                          <span>Submit Compatibility Test</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Results Column */}
                <div className="lg:col-span-7">
                  {compResult ? (
                    <div className="space-y-8">
                      {/* Metric Banner */}
                      <div className="bg-white border border-[#1A1A1A]/10 p-6 md:p-8 space-y-6 relative overflow-hidden">
                        
                        <div className="flex justify-between items-baseline border-b border-[#1A1A1A] pb-4">
                          <div>
                            <span className="text-[10px] uppercase font-sans font-extrabold tracking-widest text-slate-400">Result Analysis</span>
                            <h3 className="text-3xl font-serif italic text-slate-800">Gun Milan Synthesis</h3>
                          </div>
                          
                          <div className="text-right">
                            <span className="text-[10px] uppercase font-sans block text-[#8B4513] font-bold">Total Gunas Match</span>
                            <span className="text-4xl font-serif font-bold text-[#1A1A1A] italic">
                              {compResult.gunsMatched} / 36
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar Gunas */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-slate-500 font-sans">
                            <span>Soma-Surya alignment index</span>
                            <span className="font-serif italic font-bold text-[#1A1A1A]">{compResult.compatibilityScore}% Harmonized</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-none overflow-hidden relative">
                            <div
                              className="bg-[#D4AF37] h-full absolute transition-all duration-1000"
                              style={{ width: `${compResult.compatibilityScore}%` }}
                            />
                          </div>
                        </div>

                        {/* Basic parameters */}
                        <div className="grid grid-cols-2 gap-4 bg-[#FDFBF7] p-4 text-xs font-sans">
                          <div>
                            <span className="text-slate-400 uppercase tracking-widest font-bold text-[9px] block">First Partner Rashi & Nakshatra</span>
                            <span className="text-slate-800 font-serif font-extrabold mt-1 block">
                              {compResult.partnerA_Rashi} ({compResult.partnerA_Nakshatra})
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 uppercase tracking-widest font-bold text-[9px] block">Second Partner Rashi & Nakshatra</span>
                            <span className="text-slate-800 font-serif font-extrabold mt-1 block">
                              {compResult.partnerB_Rashi} ({compResult.partnerB_Nakshatra})
                            </span>
                          </div>
                        </div>

                        {/* Analysis narrative */}
                        <div className="space-y-2">
                          <h4 className="text-xs uppercase tracking-widest text-[#8B4513] font-sans font-bold">Verdict Opinion</h4>
                          <blockquote className="text-sm border-l-2 border-[#1A1A1A] pl-4 py-1 text-slate-700 italic leading-relaxed">
                            {compResult.verdict}
                          </blockquote>
                          <p className="text-xs text-slate-600 leading-relaxed pt-2 font-sans">
                            {compResult.detailedAnalysis}
                          </p>
                        </div>
                      </div>

                      {/* Strengths & Challenges */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white border border-[#1A1A1A]/10 p-5 space-y-2">
                          <span className="text-[10px] uppercase font-sans font-bold tracking-widest text-teal-700 block">
                            🍀 Primary Synergy Strengths
                          </span>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {compResult.strengths}
                          </p>
                        </div>

                        <div className="bg-white border border-[#1A1A1A]/10 p-5 space-y-2">
                          <span className="text-[10px] uppercase font-sans font-bold tracking-widest text-[#8B4513] block">
                            ⚠️ Karmic Friction Factors
                          </span>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {compResult.challenges}
                          </p>
                        </div>
                      </div>

                      {/* Remedy for marital delays or nadi dosha */}
                      <div className="bg-white border border-[#1A1A1A]/10 p-6 space-y-3">
                        <span className="text-[10px] uppercase font-sans font-bold tracking-wider text-[#D4AF37] block">
                          Suggested Synastry Remedy (Observational Mitigation)
                        </span>
                        <p className="text-xs text-slate-700 leading-relaxed italic bg-amber-50/20 p-4 border border-[#D4AF37]/10">
                          {compResult.remedy}
                        </p>
                      </div>

                      {/* Ashta Koota Breakdowns */}
                      <div className="bg-white border border-[#1A1A1A]/10 p-6 space-y-4">
                        <div className="flex justify-between items-center border-b border-[#1A1A1A] pb-2">
                          <span className="text-xs font-serif uppercase tracking-wider font-semibold text-slate-800">
                            Traditional Gun Breakdown (Ashta Kootas)
                          </span>
                          <span className="text-[9px] uppercase font-sans font-bold text-slate-400">Score Out of 36 max</span>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs bg-[#FDFBF7]">
                            <thead>
                              <tr className="bg-slate-50 border-b border-[#1A1A1A]/10 text-slate-800 font-sans">
                                <th className="p-2 uppercase tracking-wide font-bold text-[9px]">Guna Category (Koota)</th>
                                <th className="p-2 uppercase tracking-wide font-bold text-[9px]">Significance Purpose</th>
                                <th className="p-2 text-right uppercase tracking-wide font-bold text-[9px]">Earned / Max Points</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100/80 font-sans text-slate-600">
                              {compResult.gunAnalysis?.map((el, i) => (
                                <tr key={i} className="hover:bg-amber-50/5">
                                  <td className="p-2 font-serif text-[#1A1A1A] font-bold text-xs">{el.kootaName}</td>
                                  <td className="p-2 text-[11px] text-slate-500">{el.description}</td>
                                  <td className="p-2 text-right font-mono font-bold text-slate-700">
                                    <span className={el.pointsScored === 0 ? "text-red-600" : "text-[#1A1A1A]"}>
                                      {el.pointsScored}
                                    </span>{" "}
                                    / {el.maxPoints}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className="h-full border border-dashed border-[#1A1A1A]/15 bg-white p-12 flex flex-col items-center justify-center text-center space-y-4">
                      <Heart className="w-12 h-12 text-[#1A1A1A]/10" />
                      <div className="space-y-1.5 max-w-sm">
                        <h4 className="font-serif text-xl italic text-slate-600">Sync Inactive</h4>
                        <p className="text-xs text-slate-500 leading-relaxed font-sans">
                          Submit birth dates and places for both charts on the registry board to construct Kundlis and compile the 36-point compatibility matrix.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: KUNDLI BLUEPRINT FORM */}
          {activeTab === "kundli" && (
            <div className="animate-fade-in">
              <VedicProfileForm />
            </div>
          )}

        </main>

        {/* FOOTER */}
        <footer className="mt-12 border-t border-[#1A1A1A]/10 pt-6 flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-[0.2em] font-sans text-slate-500 gap-4 md:gap-0 select-none">
          <span>COORDINATES DETECTED: 28.6139° N, 77.2090° E (DEFAULT SIDEREAL EPOCH)</span>
          <span>© 2026 Soma & Surya • VedicPath Systems • New Delhi, India</span>
        </footer>

      </div>
    </div>
  );
}
