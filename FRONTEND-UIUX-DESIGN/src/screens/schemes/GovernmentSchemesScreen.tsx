import React from 'react';
import { motion } from 'framer-motion';
import { Landmark, Search, Shield, Heart, Home, Baby, Wheat } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface GovernmentSchemesScreenProps {}

interface SchemeCardProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  tag: string;
  tagColor: string;
}

const SchemeCard: React.FC<SchemeCardProps> = ({ icon, iconBg, title, description, tag, tagColor }) => {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-bold text-slate-800 leading-snug">{title}</p>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${tagColor}`}>{tag}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug">{description}</p>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <button
            type="button"
            className="flex-1 py-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold text-center"
          >
            {t('schemes.checkEligibility')}
          </button>
          <button
            type="button"
            className="flex-1 py-2 rounded-xl bg-[#0D9488] text-white text-xs font-semibold text-center"
          >
            {t('schemes.applyNow')}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export const GovernmentSchemesScreen: React.FC<GovernmentSchemesScreenProps> = () => {
  const { t } = useTranslation();

  const schemes = [
    {
      icon: <Heart className="w-5 h-5 text-rose-600" />,
      iconBg: 'bg-rose-50',
      title: 'Ayushman Bharat',
      description: t('schemes.ayushmanDesc'),
      tag: t('schemes.statusActive'),
      tagColor: 'bg-emerald-50 text-emerald-700',
    },
    {
      icon: <Baby className="w-5 h-5 text-pink-600" />,
      iconBg: 'bg-pink-50',
      title: 'Janani Suraksha Yojana',
      description: t('schemes.jananiDesc'),
      tag: t('schemes.statusActive'),
      tagColor: 'bg-emerald-50 text-emerald-700',
    },
    {
      icon: <Wheat className="w-5 h-5 text-amber-600" />,
      iconBg: 'bg-amber-50',
      title: 'PMGKAY — PDS',
      description: t('schemes.pmgkayDesc'),
      tag: t('schemes.statusApplied'),
      tagColor: 'bg-blue-50 text-blue-700',
    },
    {
      icon: <Home className="w-5 h-5 text-indigo-600" />,
      iconBg: 'bg-indigo-50',
      title: 'PMAY — Housing',
      description: t('schemes.pmayDesc'),
      tag: t('schemes.statusPending'),
      tagColor: 'bg-amber-50 text-amber-700',
    },
    {
      icon: <Shield className="w-5 h-5 text-purple-600" />,
      iconBg: 'bg-purple-50',
      title: 'PMJAY — Insurance',
      description: t('schemes.pmjayDesc'),
      tag: t('schemes.statusActive'),
      tagColor: 'bg-emerald-50 text-emerald-700',
    },
  ];


  return (
    <div className="w-full bg-[#F5F6FA] min-h-full py-3 px-4">
      <div className="max-w-lg mx-auto space-y-3 pb-4">

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
              <h1 className="text-base font-black text-white tracking-tight leading-tight">{t('schemes.pageTitle')}</h1>
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
          <span className="text-sm text-slate-400 font-medium">{t('schemes.searchPlaceholder')}</span>
        </motion.div>

        {/* Filter Pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.28, delay: 0.1 }}
          className="flex gap-2 overflow-x-auto pb-0.5 no-scrollbar"
        >
          {(['filterAll', 'filterActive', 'filterPending', 'filterApplied'] as const).map((key, i) => (
            <button
              key={key}
              type="button"
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 border transition-colors ${
                i === 0
                  ? 'bg-[#0D9488] text-white border-transparent'
                  : 'bg-white text-slate-600 border-slate-200'
              }`}
            >
              {t(`schemes.${key}`)}
            </button>
          ))}
        </motion.div>

        {/* Scheme Cards */}
        {schemes.map((scheme, i) => (
          <motion.div
            key={scheme.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.12 + i * 0.06 }}
          >
            <SchemeCard
              icon={scheme.icon}
              iconBg={scheme.iconBg}
              title={scheme.title}
              description={scheme.description}
              tag={scheme.tag}
              tagColor={scheme.tagColor}
            />
          </motion.div>
        ))}

      </div>
    </div>
  );
};

export default GovernmentSchemesScreen;
