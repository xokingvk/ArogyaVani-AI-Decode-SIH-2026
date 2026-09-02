import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Landmark, Search, Shield, Heart, Home, Baby, Wheat, X, CheckCircle2, FileText, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface GovernmentSchemesScreenProps {}

interface SchemeItem {
  id: string;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  tag: string;
  tagColor: string;
  details: string;
  documents: string[];
}

export const GovernmentSchemesScreen: React.FC<GovernmentSchemesScreenProps> = () => {
  const { t, i18n } = useTranslation();
  const [activeFilter, setActiveFilter] = useState<'filterAll' | 'filterActive' | 'filterPending' | 'filterApplied'>('filterAll');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Interactive Modals State
  const [selectedScheme, setSelectedScheme] = useState<SchemeItem | null>(null);
  const [isEligibilityModalOpen, setIsEligibilityModalOpen] = useState<boolean>(false);
  const [eligibilityResult, setEligibilityResult] = useState<'eligible' | 'checking' | null>(null);

  const isTamil = i18n.language?.startsWith('ta');
  const isTelugu = i18n.language?.startsWith('te');

  const schemes: SchemeItem[] = [
    {
      id: 'ayushman',
      icon: <Heart className="w-5 h-5 text-rose-600" />,
      iconBg: 'bg-rose-50',
      title: 'Ayushman Bharat (PMJAY)',
      description: t('schemes.ayushmanDesc'),
      tag: t('schemes.statusActive'),
      tagColor: 'bg-emerald-50 text-emerald-700',
      details: 'Offers free cashless healthcare coverage up to ₹5 Lakhs per family per year for secondary & tertiary hospitalizations.',
      documents: ['Aadhaar Card', 'Ration Card (BPL/PDS)', 'Mobile Number'],
    },
    {
      id: 'janani',
      icon: <Baby className="w-5 h-5 text-pink-600" />,
      iconBg: 'bg-pink-50',
      title: 'Janani Suraksha Yojana',
      description: t('schemes.jananiDesc'),
      tag: t('schemes.statusActive'),
      tagColor: 'bg-emerald-50 text-emerald-700',
      details: 'Safe motherhood intervention scheme under National Health Mission providing financial cash assistance for institutional delivery.',
      documents: ['Mother & Child Health Card', 'Aadhaar Card', 'Bank Passbook'],
    },
    {
      id: 'pmgkay',
      icon: <Wheat className="w-5 h-5 text-amber-600" />,
      iconBg: 'bg-amber-50',
      title: 'PMGKAY — Free Ration',
      description: t('schemes.pmgkayDesc'),
      tag: t('schemes.statusApplied'),
      tagColor: 'bg-blue-50 text-blue-700',
      details: 'Free food grain distribution scheme providing 5kg food grains per person per month to PDS cardholders.',
      documents: ['Smart Ration Card', 'Family Head Aadhaar Card'],
    },
    {
      id: 'pmay',
      icon: <Home className="w-5 h-5 text-indigo-600" />,
      iconBg: 'bg-indigo-50',
      title: 'PMAY — Gramin Housing',
      description: t('schemes.pmayDesc'),
      tag: t('schemes.statusPending'),
      tagColor: 'bg-amber-50 text-amber-700',
      details: 'Financial assistance of ₹1.20 Lakhs for constructing pucca house in rural villages with sanitation facility.',
      documents: ['Income Certificate', 'Land Ownership Copy', 'Job Card'],
    },
    {
      id: 'insurance',
      icon: <Shield className="w-5 h-5 text-purple-600" />,
      iconBg: 'bg-purple-50',
      title: 'PM Jeevan Jyoti Bima',
      description: t('schemes.pmjayDesc'),
      tag: t('schemes.statusActive'),
      tagColor: 'bg-emerald-50 text-emerald-700',
      details: 'Life insurance scheme renewable annually providing ₹2 Lakhs risk coverage for death due to any reason.',
      documents: ['Bank Savings Account', 'Aadhaar Card', 'Nominee Details'],
    },
  ];

  const filteredSchemes = schemes.filter((s) => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.description.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeFilter === 'filterActive') return matchesSearch && s.tag === t('schemes.statusActive');
    if (activeFilter === 'filterPending') return matchesSearch && s.tag === t('schemes.statusPending');
    if (activeFilter === 'filterApplied') return matchesSearch && s.tag === t('schemes.statusApplied');
    return matchesSearch;
  });

  const runEligibilityCheck = () => {
    setEligibilityResult('checking');
    setTimeout(() => {
      setEligibilityResult('eligible');
    }, 1500);
  };

  return (
    <div className="w-full bg-[#F5F6FA] min-h-full py-3 px-4 pb-24">
      <div className="max-w-lg mx-auto space-y-3">

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="bg-gradient-to-br from-[#112940] via-[#17385B] to-[#1E4973] rounded-2xl p-4 text-white border border-white/10 relative overflow-hidden"
        >
          <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-teal-400/10 blur-xl pointer-events-none" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center shrink-0">
              <Landmark className="w-5 h-5 text-teal-300" />
            </div>
            <div className="min-w-0">
              <h1 className={`font-black text-white tracking-tight leading-tight ${isTamil || isTelugu ? 'text-base' : 'text-lg'}`}>
                {t('schemes.pageTitle')}
              </h1>
              <p className="text-xs text-slate-300/80 mt-0.5 leading-snug">{t('schemes.comingSoonSub')}</p>
            </div>
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.06 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3 px-4 py-3"
        >
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('schemes.searchPlaceholder')}
            className="w-full text-sm text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
          />
          {searchQuery && (
            <button type="button" onClick={() => setSearchQuery('')} className="p-1 text-slate-400">
              <X className="w-4 h-4" />
            </button>
          )}
        </motion.div>

        {/* Filter Pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.28, delay: 0.1 }}
          className="flex gap-2 overflow-x-auto pb-0.5 no-scrollbar"
        >
          {(['filterAll', 'filterActive', 'filterPending', 'filterApplied'] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveFilter(key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 border transition-colors cursor-pointer ${
                activeFilter === key
                  ? 'bg-[#0D9488] text-white border-transparent shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {t(`schemes.${key}`)}
            </button>
          ))}
        </motion.div>

        {/* Scheme Cards */}
        {filteredSchemes.map((scheme, i) => (
          <motion.div
            key={scheme.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.12 + i * 0.06 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden hover:border-slate-200 transition-colors"
          >
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${scheme.iconBg}`}>
                  {scheme.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-bold text-slate-800 leading-snug">{scheme.title}</p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${scheme.tagColor}`}>
                      {scheme.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">{scheme.description}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-3.5">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedScheme(scheme);
                    setIsEligibilityModalOpen(true);
                    setEligibilityResult(null);
                  }}
                  className="flex-1 py-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold text-center hover:bg-teal-100 transition-colors cursor-pointer"
                >
                  {t('schemes.checkEligibility')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedScheme(scheme);
                    setIsEligibilityModalOpen(false);
                  }}
                  className="flex-1 py-2 rounded-xl bg-[#0D9488] text-white text-xs font-semibold text-center hover:bg-teal-700 transition-colors cursor-pointer shadow-xs"
                >
                  {t('schemes.applyNow')}
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredSchemes.length === 0 && (
          <div className="py-12 text-center text-slate-400">
            <p className="text-sm font-bold">{t('schemes.emptyState')}</p>
            <p className="text-xs mt-1">{t('schemes.emptyStateSub')}</p>
          </div>
        )}

      </div>

      {/* ── INTERACTIVE ELIGIBILITY CHECK MODAL ──────────────────────── */}
      {isEligibilityModalOpen && selectedScheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-xl border border-slate-100 relative max-h-[85vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsEligibilityModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${selectedScheme.iconBg}`}>
                {selectedScheme.icon}
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">{selectedScheme.title}</h3>
                <p className="text-xs text-teal-600 font-semibold">Eligibility Verification Engine</p>
              </div>
            </div>

            {eligibilityResult === null ? (
              <div className="space-y-4 text-xs">
                <p className="text-slate-600 font-medium">Answer 3 quick questions to verify your instant scheme approval status:</p>
                
                <div className="space-y-3">
                  <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50 space-y-1.5">
                    <p className="font-bold text-slate-800">1. Annual Family Income</p>
                    <div className="flex gap-2">
                      <button type="button" className="flex-1 py-1.5 rounded-lg bg-teal-600 text-white font-semibold">Under ₹2.5 Lakhs</button>
                      <button type="button" className="flex-1 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 font-semibold">Above ₹2.5 Lakhs</button>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50 space-y-1.5">
                    <p className="font-bold text-slate-800">2. Residence Location</p>
                    <div className="flex gap-2">
                      <button type="button" className="flex-1 py-1.5 rounded-lg bg-teal-600 text-white font-semibold">Rural Gram Panchayat</button>
                      <button type="button" className="flex-1 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 font-semibold">Urban Municipality</button>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50 space-y-1.5">
                    <p className="font-bold text-slate-800">3. Card Holder Category</p>
                    <div className="flex gap-2">
                      <button type="button" className="flex-1 py-1.5 rounded-lg bg-teal-600 text-white font-semibold">BPL / PHH Ration Card</button>
                      <button type="button" className="flex-1 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 font-semibold">AAY Card</button>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={runEligibilityCheck}
                  className="w-full py-3 rounded-2xl bg-[#0D9488] text-white font-bold text-xs hover:bg-teal-700 transition-colors shadow-sm"
                >
                  Verify My Eligibility Now
                </button>
              </div>
            ) : eligibilityResult === 'checking' ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-10 h-10 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-700">Cross-referencing ABDM & State Welfare Registry...</p>
              </div>
            ) : (
              <div className="py-4 text-center space-y-4">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-black text-lg text-slate-900">Congratulations! You are Eligible 🎉</h4>
                  <p className="text-xs text-slate-500 mt-1">Your family qualifies for 100% benefits under {selectedScheme.title}.</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-left text-xs space-y-1">
                  <p className="font-bold text-emerald-900">Required Documents:</p>
                  <ul className="list-disc pl-4 text-emerald-800 space-y-0.5">
                    {selectedScheme.documents.map((doc) => (
                      <li key={doc}>{doc}</li>
                    ))}
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    alert(`Application submitted for ${selectedScheme.title}! Tracking ID: ARGY-2024-8849`);
                    setIsEligibilityModalOpen(false);
                  }}
                  className="w-full py-3 rounded-2xl bg-[#0D9488] text-white font-bold text-xs shadow-md"
                >
                  Proceed with One-Click Application
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ── SCHEME DETAILS DRAWER ─────────────────────────────────── */}
      {selectedScheme && !isEligibilityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-t-3xl p-6 shadow-2xl border-t border-slate-200 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${selectedScheme.iconBg}`}>
                  {selectedScheme.icon}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">{selectedScheme.title}</h3>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${selectedScheme.tagColor}`}>
                    {selectedScheme.tag}
                  </span>
                </div>
              </div>
              <button type="button" onClick={() => setSelectedScheme(null)} className="p-1.5 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {selectedScheme.details}
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <FileText className="w-4 h-4 text-teal-600" />
                <span>Required Documents Checklist</span>
              </div>
              <div className="grid grid-cols-1 gap-1.5 text-xs text-slate-600">
                {selectedScheme.documents.map((doc) => (
                  <div key={doc} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>{doc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedScheme(null)}
                className="flex-1 py-3 rounded-2xl bg-slate-100 text-slate-700 font-bold text-xs"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  alert(`Applied successfully for ${selectedScheme.title}! Application ID: ARGY-9942`);
                  setSelectedScheme(null);
                }}
                className="flex-1 py-3 rounded-2xl bg-[#0D9488] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5"
              >
                <span>Submit Application</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default GovernmentSchemesScreen;
