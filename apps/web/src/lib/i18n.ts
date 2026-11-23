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
  brand: string;
  tagline: string;
  navHome: string;
  navAbout: string;
  navHelp: string;
  navContact: string;
  languageSwitch: string;
  signIn: string;
  comingSoon: string;
  heroBadge: string;
  heroTitle: string;
  heroText: string;
  heroPoints: [string, string, string];
  step1Title: string;
  step1Text: string;
  step2Title: string;
  step2Text: string;
  step3Title: string;
  step3Text: string;
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
  nextTitle: string;
  nextText: string;
  nextNote: string;
  whyTitle: string;
  whyItems: { title: string; text: string; soon?: boolean }[];
  footerTagline: string;
  footerVerification: string;
  github: string;
}

// NOTE: Bangla wording is a first draft and must be reviewed by a language/academic reviewer.
export const STRINGS: Record<SupportedLanguage, Strings> = {
  en: {
    brand: 'ENGLISH HONOURS',
    tagline: 'Learn • Read • Understand',
    navHome: 'Home',
    navAbout: 'About',
    navHelp: 'Help',
    navContact: 'Contact',
    languageSwitch: 'বাংলা',
    signIn: 'Sign In',
    comingSoon: 'Coming soon',
    heroBadge: 'Your Academic Journey Starts Here',
    heroTitle: 'English Honours Learning Platform',
    heroText:
      'Study literature, language and criticism with clear English lessons and Bangla explanations.',
    heroPoints: ['Better Understanding', 'Stronger Critical Thinking', 'Brighter Future'],
    step1Title: 'Choose your university',
    step1Text: 'Select the university where you are currently studying.',
    step2Title: 'Choose your program',
    step2Text: 'Select your degree program at this university.',
    step3Title: 'Choose your level',
    step3Text: 'Select your academic level.',
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
    nextTitle: 'What happens next?',
    nextText:
      'After selecting your university, you will see the five academic levels. Each university has its own courses, syllabus, credits and academic details.',
    nextNote: 'Same academic levels, different university curricula.',
    whyTitle: 'Why choose our platform?',
    whyItems: [
      {
        title: 'University-Specific Syllabus',
        text: 'Course information is shown only as it appears in each university’s own official documents.',
      },
      {
        title: 'Bilingual Learning',
        text: 'English lessons with Bangla explanations.',
      },
      {
        title: 'Quality Study Materials',
        text: 'Notes, summaries, questions and more.',
        soon: true,
      },
      {
        title: 'Track Your Progress',
        text: 'Monitor your learning and achieve your goals.',
        soon: true,
      },
    ],
    footerTagline: 'Better Learning. Brighter Future.',
    footerVerification:
      'Every syllabus is checked against an official university document before it is marked as verified.',
    github: 'Project on GitHub',
  },
  bn: {
    brand: 'ইংরেজি অনার্স',
    tagline: 'শিখুন • পড়ুন • বুঝুন',
    navHome: 'হোম',
    navAbout: 'পরিচিতি',
    navHelp: 'সহায়তা',
    navContact: 'যোগাযোগ',
    languageSwitch: 'English',
    signIn: 'সাইন ইন',
    comingSoon: 'শীঘ্রই আসছে',
    heroBadge: 'আপনার একাডেমিক যাত্রা শুরু হোক এখানে',
    heroTitle: 'ইংরেজি অনার্স লার্নিং প্ল্যাটফর্ম',
    heroText: 'সহজ ইংরেজি পাঠ ও বাংলা ব্যাখ্যার মাধ্যমে সাহিত্য, ভাষা ও সমালোচনা শিখুন।',
    heroPoints: ['ভালো বোঝাপড়া', 'শক্তিশালী সমালোচনামূলক চিন্তা', 'উজ্জ্বল ভবিষ্যৎ'],
    step1Title: 'আপনার বিশ্ববিদ্যালয় নির্বাচন করুন',
    step1Text: 'আপনি যে বিশ্ববিদ্যালয়ে বর্তমানে পড়ছেন সেটি নির্বাচন করুন।',
    step2Title: 'আপনার প্রোগ্রাম নির্বাচন করুন',
    step2Text: 'এই বিশ্ববিদ্যালয়ে আপনার ডিগ্রি প্রোগ্রাম নির্বাচন করুন।',
    step3Title: 'আপনার স্তর নির্বাচন করুন',
    step3Text: 'আপনার একাডেমিক স্তর নির্বাচন করুন।',
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
    nextTitle: 'এরপর কী হবে?',
    nextText:
      'বিশ্ববিদ্যালয় নির্বাচনের পর আপনি পাঁচটি একাডেমিক স্তর দেখতে পাবেন। প্রতিটি বিশ্ববিদ্যালয়ের নিজস্ব কোর্স, সিলেবাস, ক্রেডিট ও একাডেমিক তথ্য রয়েছে।',
    nextNote: 'একাডেমিক স্তর একই, বিশ্ববিদ্যালয়ভেদে পাঠ্যক্রম আলাদা।',
    whyTitle: 'কেন আমাদের প্ল্যাটফর্ম?',
    whyItems: [
      {
        title: 'বিশ্ববিদ্যালয়ভিত্তিক সিলেবাস',
        text: 'প্রতিটি বিশ্ববিদ্যালয়ের নিজস্ব অফিসিয়াল নথিতে যেভাবে আছে, কোর্সের তথ্য কেবল সেভাবেই দেখানো হয়।',
      },
      {
        title: 'দ্বিভাষিক শিক্ষা',
        text: 'ইংরেজি পাঠ ও বাংলা ব্যাখ্যা।',
      },
      {
        title: 'মানসম্মত পাঠসামগ্রী',
        text: 'নোট, সারসংক্ষেপ, প্রশ্ন এবং আরও অনেক কিছু।',
        soon: true,
      },
      {
        title: 'অগ্রগতি ট্র্যাক করুন',
        text: 'আপনার শেখার অগ্রগতি দেখুন এবং লক্ষ্যে পৌঁছান।',
        soon: true,
      },
    ],
    footerTagline: 'ভালো শিক্ষা। উজ্জ্বল ভবিষ্যৎ।',
    footerVerification:
      'যাচাইকৃত হিসেবে চিহ্নিত করার আগে প্রতিটি সিলেবাস বিশ্ববিদ্যালয়ের অফিসিয়াল নথির সাথে মিলিয়ে দেখা হয়।',
    github: 'GitHub-এ প্রকল্প',
  },
};
