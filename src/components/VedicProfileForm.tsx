import { useState, FormEvent } from "react";
import { User, Calendar, Clock, MapPin, Sparkles, Shield, Heart } from "lucide-react";
import { BirthDetails, VedicProfile } from "../types";

export default function VedicProfileForm() {
  const [formData, setFormData] = useState<BirthDetails>({
    name: "",
    birthDate: "1998-06-15",
    birthTime: "08:30",
    birthPlace: "Mumbai, India",
  });

  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<VedicProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);

  const steps = [
    "Contacting Sidereal Coordinates...",
    "Calculating Moon Longitudes...",
    "Gazing Nakshatra Mansions...",
    "Aligning Lagna Ascendants...",
    "Interpreting Traditional Vedic Doshas..."
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.birthPlace.trim()) {
      setError("Please complete all birth details to map your chart accurately.");
      return;
    }

    setLoading(true);
    setError(null);
    setProfile(null);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < steps.length) {
        setLoadingStep(step);
      } else {
        clearInterval(interval);
      }
    }, 600);

    try {
      const res = await fetch("/api/vedic-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Chart decoding failed");
      const data = await res.json();
      setProfile(data);
    } catch {
      setError("Could not resolve planetary coordinates. Please try again.");
    } finally {
      clearInterval(interval);
      setLoading(false);
      setLoadingStep(0);
    }
  };

  return (
    <div id="vedic_chart_hub" className="space-y-12">
      {/* Introduction Card */}
      <div className="border-b border-[#1A1A1A] pb-6">
        <span className="text-[10px] uppercase tracking-[0.25em] font-sans font-semibold text-[#8B4513] block mb-1">Sidereal Identity Mapping</span>
        <h2 className="text-4xl md:text-5xl font-light italic tracking-tight font-serif text-[#1A1A1A]">
          Personalized Kundli Chart
        </h2>
        <p className="text-sm text-slate-600 mt-2 font-sans max-w-3xl leading-relaxed">
          Vedic Sidereal astrology (Jyotish) charts your life's spiritual blueprint using exact stellar longitudes at your birth moment. Input your coordinates below to discover your Nakshatra (lunar seat), Chandra Rashi, and planetary energies.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Registration Form */}
        <div className="lg:col-span-5 bg-white border border-[#1A1A1A]/10 p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-[#1A1A1A]/10 pb-4">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="font-serif text-lg tracking-wide uppercase font-semibold text-[#1A1A1A]">Register Birth Details</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-slate-500 block">Full Name</label>
              <div className="relative">
                <User className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="editorial-input pl-6"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-slate-500 block">Birth Date</label>
                <div className="relative">
                  <Calendar className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="editorial-input pl-6"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-slate-500 block">Birth Time</label>
                <div className="relative">
                  <Clock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="time"
                    value={formData.birthTime}
                    onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
                    className="editorial-input pl-6"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-slate-500 block">Place of Birth</label>
              <div className="relative">
                <MapPin className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="City, State, Country"
                  value={formData.birthPlace}
                  onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                  className="editorial-input pl-6"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-700 font-sans border border-red-200 bg-red-50/50 p-3 rounded-none">
                {error}
              </p>
            )}

            <button
              id="generate_chart_btn"
              type="submit"
              disabled={loading}
              className="w-full ink-btn-primary"
            >
              {loading ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>COMMUNING METRICS...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Sidereal Blueprint</span>
                </>
              )}
            </button>
          </form>

          {loading && (
            <div className="text-center py-4 space-y-3 animate-pulse border-t border-[#1A1A1A]/10 mt-4">
              <p className="text-xs font-serif text-[#8B4513] italic tracking-wider">
                {steps[loadingStep]}
              </p>
              <div className="w-full bg-[#1A1A1A]/5 h-[1px]">
                <div
                  className="bg-[#1A1A1A] h-full transition-all duration-500"
                  style={{ width: `${((loadingStep + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Natal Profile Display */}
        <div className="lg:col-span-7">
          {profile ? (
            <div className="space-y-8">
              {/* Profile Header */}
              <div className="bg-white border border-[#1A1A1A]/10 p-6 md:p-8 space-y-6 relative">
                <div className="flex flex-wrap justify-between items-start gap-4 border-b border-[#1A1A1A] pb-6">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-sans font-bold tracking-[0.2em] text-[#D4AF37]">Natal Charter</span>
                    <h3 className="text-4xl font-serif font-light italic text-[#1A1A1A]">{profile.name}</h3>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Birth Event: {profile.birthDate} • {profile.birthTime} ({profile.birthPlace})
                    </p>
                  </div>
                  <div className="border border-[#1A1A1A] px-4 py-2 rounded-none text-center bg-[#FDFBF7]">
                    <span className="text-[9px] text-slate-500 uppercase font-sans font-bold tracking-widest block">Rashi Lord</span>
                    <span className="text-sm font-serif italic text-[#1A1A1A]">{profile.rashiLord}</span>
                  </div>
                </div>

                {/* Primary Vedic Attributes */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-[#FDFBF7] p-3 border border-[#1A1A1A]/10">
                    <span className="text-[9px] uppercase font-sans text-slate-400 font-bold tracking-wider block">Moon (Chandra) Rashi</span>
                    <span className="text-base font-serif font-semibold text-[#1A1A1A] block truncate">{profile.rashi}</span>
                  </div>
                  <div className="bg-[#FDFBF7] p-3 border border-[#1A1A1A]/10">
                    <span className="text-[9px] uppercase font-sans text-slate-400 font-bold tracking-wider block">Ascendant (Lagna)</span>
                    <span className="text-base font-serif font-semibold text-[#1A1A1A] block truncate">{profile.lagna}</span>
                  </div>
                  <div className="bg-[#FDFBF7] p-3 border border-[#1A1A1A]/10">
                    <span className="text-[9px] uppercase font-sans text-slate-400 font-bold tracking-wider block">Lunar Nakshatra</span>
                    <span className="text-base font-serif font-semibold text-[#1A1A1A] block truncate">{profile.nakshatra}</span>
                  </div>
                  <div className="bg-[#FDFBF7] p-3 border border-[#1A1A1A]/10">
                    <span className="text-[9px] uppercase font-sans text-slate-400 font-bold tracking-wider block">Nakshatra Lord</span>
                    <span className="text-base font-serif font-semibold text-[#1A1A1A] block truncate">{profile.nakshatraLord}</span>
                  </div>
                </div>

                {/* Dosha, Element & Talismans */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-y border-[#1A1A1A]/10 py-5 bg-[#FDFBF7]/40 px-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-slate-400 block">Dosha Typology</span>
                    <span className="text-sm text-[#1A1A1A]">🧘 {profile.doshaDominance} dominance</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#8B4513] block">Cosmic Element</span>
                    <span className="text-sm text-[#1A1A1A]">🔥 {profile.element} element</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#D4AF37] block">Talisman & Gemstone</span>
                    <span className="text-sm text-[#1A1A1A] truncate block">
                      💎 {profile.gemstone} ({profile.luckyColor})
                    </span>
                  </div>
                </div>

                {/* Deep Astrological Reading text */}
                <div className="space-y-3">
                  <h4 className="font-serif text-lg text-[#1A1A1A] italic font-semibold border-b border-[#1A1A1A]/5 pb-1">Celestial Synthesis</h4>
                  <p className="text-sm text-slate-700 leading-relaxed text-justify font-sans bg-slate-50/50 p-4 border border-[#1A1A1A]/5">
                    {profile.generalReading}
                  </p>
                </div>
              </div>

              {/* Strengths and Warnings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-[#1A1A1A]/10 p-6 space-y-4">
                  <h4 className="font-serif text-lg text-[#1A1A1A] italic font-semibold flex items-center gap-2 border-b border-[#1A1A1A]/5 pb-2">
                    <Shield className="w-4 h-4 text-slate-700" /> Auspicious Potentials
                  </h4>
                  <ul className="space-y-2.5 text-xs text-slate-600 font-sans">
                    {profile.strengths.map((st, idx) => (
                      <li key={idx} className="flex gap-2 items-start">
                        <span className="text-[#D4AF37]">✦</span>
                        <span>{st}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white border border-[#1A1A1A]/10 p-6 space-y-4">
                  <h4 className="font-serif text-lg text-[#1A1A1A] italic font-semibold flex items-center gap-2 border-b border-[#1A1A1A]/5 pb-2">
                    <Heart className="w-4 h-4 text-[#8B4513]" /> Karmic Directives
                  </h4>
                  <ul className="space-y-2.5 text-xs text-slate-600 font-sans">
                    {profile.weaknesses.map((wk, idx) => (
                      <li key={idx} className="flex gap-2 items-start">
                        <span className="text-[#8B4513]">✦</span>
                        <span>{wk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Planetary Placements Coordinates */}
              <div className="bg-white border border-[#1A1A1A]/10 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-3">
                  <h4 className="font-serif text-lg text-[#1A1A1A] italic">
                    Kundli Graha Placements (Planetary Positions)
                  </h4>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Sidereal System</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs bg-[#FDFBF7] border border-[#1A1A1A]/5">
                    <thead>
                      <tr className="bg-slate-100/65 border-b border-[#1A1A1A]/15 font-serif text-[#1A1A1A]">
                        <th className="p-3 uppercase tracking-wider font-bold font-sans text-[10px]">Graha (Planet)</th>
                        <th className="p-3 uppercase tracking-wider font-bold font-sans text-[10px]">Rashi (Sign)</th>
                        <th className="p-3 text-center uppercase tracking-wider font-bold font-sans text-[10px]">Bhava (House)</th>
                        <th className="p-3 uppercase tracking-wider font-bold font-sans text-[10px]">Sidereal Reading</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {profile.planetaryPlacements.map((placement, idx) => (
                        <tr key={idx} className="hover:bg-amber-50/10 text-slate-700">
                          <td className="p-3 font-serif font-semibold text-[#1A1A1A]">{placement.planet}</td>
                          <td className="p-3 font-serif text-slate-600 italic">{placement.sign}</td>
                          <td className="p-3 text-center font-mono text-[#8B4513] font-semibold">{placement.house}</td>
                          <td className="p-3 text-[11px] leading-relaxed max-w-sm font-sans">{placement.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full border border-dashed border-[#1A1A1A]/15 bg-white p-12 flex flex-col items-center justify-center text-center space-y-4">
              <Sparkles className="w-12 h-12 text-[#1A1A1A]/20" />
              <div className="space-y-1.5 max-w-sm">
                <h4 className="font-serif text-xl italic text-slate-600">Chart Dormant</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-sans">
                  Submit birth variables (Time, Date, Coordinates) in the register to construct your astral alignment and unpack Vedic life lessons.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
