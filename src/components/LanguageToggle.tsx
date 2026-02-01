'use client';

import { useState } from 'react';
import { Globe } from 'lucide-react';

export default function LanguageToggle() {
  const [language, setLanguage] = useState<'en' | 'ta'>('en');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ta' : 'en');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
    >
      <Globe className="w-4 h-4" />
      <span className="font-medium">
        {language === 'en' ? 'English' : 'தமிழ்'}
      </span>
    </button>
  );
}