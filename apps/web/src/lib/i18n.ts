import type { SupportedLanguage } from '@ehp/shared-types';

export interface Named {
  nameEn: string;
  nameBn: string | null;
}

/** Bangla name when the language is Bangla and a name exists; otherwise the English name. */
export function displayName(item: Named, language: SupportedLanguage): string {
  return language === 'bn' && item.nameBn ? item.nameBn : item.nameEn;
}

export interface Strings {
  siteName: string;
  languageSwitch: string;
  heroTitle: string;
  heroText: string;
  chooseTitle: string;
  university: string;
  program: string;
  level: string;
  selectPlaceholder: string;
  loading: string;
  noUniversities: string;
  noPrograms: string;
  notConnected: string;
  loadError: string;
  resultTitle: string;
  resultPrompt: string;
  noSyllabus: string;
  verified: string;
  unverified: string;
  version: string;
  footerVerification: string;
  github: string;
}

// NOTE: Bangla wording is a first draft and must be reviewed by a language/academic reviewer.
export const STRINGS: Record<SupportedLanguage, Strings> = {
  en: {
    siteName: 'English Honours Platform',
    languageSwitch: 'বাংলা',
    heroTitle: 'English Honours Learning Platform',
    heroText:
      'A bilingual learning platform for English students in Bangladesh, with university-specific syllabuses.',
    chooseTitle: 'Choose your university and level',
    university: 'University',
    program: 'Program',
    level: 'Level',
    selectPlaceholder: 'Select…',
    loading: 'Loading…',
    noUniversities: 'No universities have been added yet.',
    noPrograms: 'No programs have been added for this university yet.',
    notConnected:
      'This preview is not connected to the platform API, so universities cannot be loaded yet.',
    loadError: 'Could not load data from the platform. Please try again later.',
    resultTitle: 'Your syllabus',
    resultPrompt: 'Select a university, program and level to see the syllabus.',
    noSyllabus: 'No syllabus has been published for this selection yet.',
    verified: 'Verified against an official source',
    unverified: 'Not yet verified',
    version: 'Version',
    footerVerification:
      'Every syllabus is checked against an official university document before it is marked as verified.',
    github: 'Project on GitHub',
  },
  bn: {
    siteName: 'ইংরেজি অনার্স প্ল্যাটফর্ম',
    languageSwitch: 'English',
    heroTitle: 'ইংরেজি অনার্স লার্নিং প্ল্যাটফর্ম',
    heroText:
      'বাংলাদেশের ইংরেজি বিভাগের শিক্ষার্থীদের জন্য একটি দ্বিভাষিক শিক্ষা প্ল্যাটফর্ম, যেখানে প্রতিটি বিশ্ববিদ্যালয়ের নিজস্ব সিলেবাস থাকবে।',
    chooseTitle: 'আপনার বিশ্ববিদ্যালয় ও স্তর নির্বাচন করুন',
    university: 'বিশ্ববিদ্যালয়',
    program: 'প্রোগ্রাম',
    level: 'স্তর',
    selectPlaceholder: 'নির্বাচন করুন…',
    loading: 'লোড হচ্ছে…',
    noUniversities: 'এখনও কোনো বিশ্ববিদ্যালয় যোগ করা হয়নি।',
    noPrograms: 'এই বিশ্ববিদ্যালয়ের জন্য এখনও কোনো প্রোগ্রাম যোগ করা হয়নি।',
    notConnected:
      'এই প্রিভিউ এখনও প্ল্যাটফর্মের API-এর সাথে যুক্ত নয়, তাই বিশ্ববিদ্যালয়ের তালিকা দেখানো যাচ্ছে না।',
    loadError: 'প্ল্যাটফর্ম থেকে তথ্য আনা যায়নি। অনুগ্রহ করে পরে আবার চেষ্টা করুন।',
    resultTitle: 'আপনার সিলেবাস',
    resultPrompt: 'সিলেবাস দেখতে বিশ্ববিদ্যালয়, প্রোগ্রাম ও স্তর নির্বাচন করুন।',
    noSyllabus: 'এই নির্বাচনের জন্য এখনও কোনো সিলেবাস প্রকাশ করা হয়নি।',
    verified: 'অফিসিয়াল উৎসের সাথে যাচাই করা হয়েছে',
    unverified: 'এখনও যাচাই করা হয়নি',
    version: 'সংস্করণ',
    footerVerification:
      'যাচাইকৃত হিসেবে চিহ্নিত করার আগে প্রতিটি সিলেবাস বিশ্ববিদ্যালয়ের অফিসিয়াল নথির সাথে মিলিয়ে দেখা হয়।',
    github: 'GitHub-এ প্রকল্প',
  },
};
