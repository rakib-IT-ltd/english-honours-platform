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
  signOut: string;
  myProfile: string;
  welcomeBack: string;
  completeProfile: string;
  editProfile: string;
  signInTitle: string;
  signUpTitle: string;
  signUpLink: string;
  signInLink: string;
  email: string;
  password: string;
  passwordHint: string;
  displayName: string;
  working: string;
  authNotConfigured: string;
  errInvalidCredentials: string;
  errEmailInUse: string;
  errWeakPassword: string;
  errNetwork: string;
  errUnknown: string;
  profileTitle: string;
  profileIntro: string;
  profileSave: string;
  profileSaved: string;
  profileSaveError: string;
  profileNeedsSignIn: string;
  profileNeedsApi: string;
  backToHome: string;
  departmentLabel: string;
  viewSyllabus: string;
  syllabusPageTitle: string;
  courseListTitle: string;
  bookListTitle: string;
  noCourses: string;
  noBooks: string;
  credits: string;
  marks: string;
  byAuthor: string;
  publisher: string;
  edition: string;
  publicationYear: string;
  listedForCourse: string;
  openBook: string;
  backToSyllabus: string;
  bookNotFound: string;
  materialsSoon: string;
  selectionMissing: string;
  chooseAgain: string;
  menu: string;
  selectedUniversity: string;
  universityLabel: string;
  exploreLine: string;
  tabSyllabus: string;
  tabCourses: string;
  tabResources: string;
  overviewTitle: string;
  statProgram: string;
  statVersion: string;
  statCourses: string;
  statBooks: string;
  verifiedNote: string;
  unverifiedNote: string;
  allCourses: string;
  viewDetails: string;
  filterByCourse: string;
  sessionLabel: string;
  classHoursLabel: string;
  sessionNote: string;
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
    signOut: 'Sign out',
    myProfile: 'My profile',
    welcomeBack: 'Signed in as',
    completeProfile: 'Complete your profile to see your syllabus automatically.',
    editProfile: 'Change my university and level',
    signInTitle: 'Sign in',
    signUpTitle: 'Create your account',
    signUpLink: 'Create an account',
    signInLink: 'I already have an account',
    email: 'Email address',
    password: 'Password',
    passwordHint: 'At least 6 characters.',
    displayName: 'Your name',
    working: 'Please wait…',
    authNotConfigured: 'Sign-in is not available in this preview yet.',
    errInvalidCredentials: 'The email or password is not correct.',
    errEmailInUse: 'An account with this email already exists.',
    errWeakPassword: 'Please choose a stronger password (at least 6 characters).',
    errNetwork: 'Could not reach the sign-in service. Please check your connection.',
    errUnknown: 'Something went wrong. Please try again.',
    profileTitle: 'Your academic identity',
    profileIntro: 'Tell us where you study, so you always see the right syllabus.',
    profileSave: 'Save my profile',
    profileSaved: 'Your profile has been saved.',
    profileSaveError: 'Could not save your profile. Please try again.',
    profileNeedsSignIn: 'Please sign in to set up your profile.',
    profileNeedsApi: 'The platform API is not connected, so profiles cannot be saved yet.',
    backToHome: 'Back to home',
    departmentLabel: 'Department',
    viewSyllabus: 'View syllabus and books',
    syllabusPageTitle: 'Your syllabus and books',
    courseListTitle: 'Courses',
    bookListTitle: 'Book list',
    noCourses: 'No courses have been published for this syllabus yet.',
    noBooks: 'No books have been published for this syllabus yet.',
    credits: 'Credits',
    marks: 'Marks',
    byAuthor: 'by',
    publisher: 'Publisher',
    edition: 'Edition',
    publicationYear: 'Year',
    listedForCourse: 'Listed for course',
    openBook: 'Open',
    backToSyllabus: 'Back to syllabus',
    bookNotFound: 'This book could not be found.',
    materialsSoon: 'Notes, summaries and questions for this book are coming soon.',
    selectionMissing: 'Please choose your university, program and level first.',
    chooseAgain: 'Change selection',
    menu: 'Menu',
    selectedUniversity: 'Selected University',
    universityLabel: 'University',
    exploreLine: 'Explore your syllabus and book list',
    tabSyllabus: 'Syllabus & Book List',
    tabCourses: 'Course Details',
    tabResources: 'Study Resources',
    overviewTitle: 'Syllabus Overview',
    statProgram: 'Program',
    statVersion: 'Syllabus version',
    statCourses: 'Courses',
    statBooks: 'Books',
    verifiedNote: 'This syllabus version has been checked against an official university document.',
    unverifiedNote:
      'This syllabus version has not been checked against an official university document yet.',
    allCourses: 'All courses',
    viewDetails: 'View Details',
    filterByCourse: 'Show books of',
    sessionLabel: 'Session',
    classHoursLabel: 'Class hours',
    sessionNote:
      'This syllabus applies to the session shown above. If your session is different, check with your department.',
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
    heroTitle: 'English Honours Learning Platform',
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
    signOut: 'সাইন আউট',
    myProfile: 'আমার প্রোফাইল',
    welcomeBack: 'সাইন ইন করা আছে:',
    completeProfile: 'আপনার সিলেবাস স্বয়ংক্রিয়ভাবে দেখতে প্রোফাইল সম্পূর্ণ করুন।',
    editProfile: 'আমার বিশ্ববিদ্যালয় ও স্তর পরিবর্তন করুন',
    signInTitle: 'সাইন ইন',
    signUpTitle: 'আপনার অ্যাকাউন্ট তৈরি করুন',
    signUpLink: 'অ্যাকাউন্ট তৈরি করুন',
    signInLink: 'আমার অ্যাকাউন্ট আছে',
    email: 'ইমেইল ঠিকানা',
    password: 'পাসওয়ার্ড',
    passwordHint: 'কমপক্ষে ৬টি অক্ষর।',
    displayName: 'আপনার নাম',
    working: 'অনুগ্রহ করে অপেক্ষা করুন…',
    authNotConfigured: 'এই প্রিভিউতে এখনও সাইন ইন চালু নেই।',
    errInvalidCredentials: 'ইমেইল বা পাসওয়ার্ড সঠিক নয়।',
    errEmailInUse: 'এই ইমেইল দিয়ে আগেই একটি অ্যাকাউন্ট আছে।',
    errWeakPassword: 'আরও শক্তিশালী পাসওয়ার্ড দিন (কমপক্ষে ৬টি অক্ষর)।',
    errNetwork: 'সাইন ইন সেবায় যোগাযোগ করা যায়নি। আপনার সংযোগ পরীক্ষা করুন।',
    errUnknown: 'কিছু একটা ভুল হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
    profileTitle: 'আপনার একাডেমিক পরিচয়',
    profileIntro: 'আপনি কোথায় পড়েন তা জানান, যাতে সবসময় সঠিক সিলেবাস দেখতে পান।',
    profileSave: 'আমার প্রোফাইল সংরক্ষণ করুন',
    profileSaved: 'আপনার প্রোফাইল সংরক্ষণ করা হয়েছে।',
    profileSaveError: 'প্রোফাইল সংরক্ষণ করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।',
    profileNeedsSignIn: 'প্রোফাইল তৈরি করতে অনুগ্রহ করে সাইন ইন করুন।',
    profileNeedsApi: 'প্ল্যাটফর্মের API যুক্ত নেই, তাই এখনও প্রোফাইল সংরক্ষণ করা যাচ্ছে না।',
    backToHome: 'হোমে ফিরে যান',
    departmentLabel: 'বিভাগ',
    viewSyllabus: 'সিলেবাস ও বইয়ের তালিকা দেখুন',
    syllabusPageTitle: 'আপনার সিলেবাস ও বই',
    courseListTitle: 'কোর্সসমূহ',
    bookListTitle: 'বইয়ের তালিকা',
    noCourses: 'এই সিলেবাসের জন্য এখনও কোনো কোর্স প্রকাশ করা হয়নি।',
    noBooks: 'এই সিলেবাসের জন্য এখনও কোনো বই প্রকাশ করা হয়নি।',
    credits: 'ক্রেডিট',
    marks: 'নম্বর',
    byAuthor: 'লেখক:',
    publisher: 'প্রকাশক',
    edition: 'সংস্করণ',
    publicationYear: 'বছর',
    listedForCourse: 'যে কোর্সের জন্য তালিকাভুক্ত',
    openBook: 'খুলুন',
    backToSyllabus: 'সিলেবাসে ফিরে যান',
    bookNotFound: 'এই বইটি পাওয়া যায়নি।',
    materialsSoon: 'এই বইয়ের নোট, সারসংক্ষেপ ও প্রশ্ন শীঘ্রই আসছে।',
    selectionMissing: 'অনুগ্রহ করে আগে আপনার বিশ্ববিদ্যালয়, প্রোগ্রাম ও স্তর নির্বাচন করুন।',
    chooseAgain: 'নির্বাচন পরিবর্তন করুন',
    menu: 'মেনু',
    selectedUniversity: 'নির্বাচিত বিশ্ববিদ্যালয়',
    universityLabel: 'বিশ্ববিদ্যালয়',
    exploreLine: 'আপনার সিলেবাস ও বইয়ের তালিকা দেখুন',
    tabSyllabus: 'সিলেবাস ও বইয়ের তালিকা',
    tabCourses: 'কোর্সের বিবরণ',
    tabResources: 'পড়ার উপকরণ',
    overviewTitle: 'সিলেবাসের সারসংক্ষেপ',
    statProgram: 'প্রোগ্রাম',
    statVersion: 'সিলেবাসের সংস্করণ',
    statCourses: 'কোর্স',
    statBooks: 'বই',
    verifiedNote: 'এই সিলেবাস সংস্করণটি বিশ্ববিদ্যালয়ের অফিসিয়াল নথির সাথে যাচাই করা হয়েছে।',
    unverifiedNote: 'এই সিলেবাস সংস্করণটি এখনও বিশ্ববিদ্যালয়ের অফিসিয়াল নথির সাথে যাচাই করা হয়নি।',
    allCourses: 'সব কোর্স',
    viewDetails: 'বিস্তারিত দেখুন',
    filterByCourse: 'যে কোর্সের বই দেখাবেন',
    sessionLabel: 'সেশন',
    classHoursLabel: 'ক্লাস ঘণ্টা',
    sessionNote:
      'এই সিলেবাস উপরে দেখানো সেশনের জন্য প্রযোজ্য। আপনার সেশন ভিন্ন হলে আপনার বিভাগের সাথে যোগাযোগ করুন।',
  },
};
