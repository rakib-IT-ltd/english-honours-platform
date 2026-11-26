import type { SupportedLanguage } from '@ehp/shared-types';

interface StudyStrings {
  studyCentre: string;
  yourStudyCentre: string;
  exploreEssay: string;
  continueLearning: string;
  currentSection: string;
  readingProgress: string;
  continueReading: string;
  startReading: string;
  studyResources: string;
  structure: string;
  sectionsWord: string;
  resourceNames: Record<string, string>;
  resourceHints: Record<string, string>;
  centralIdeas: string;
  centralIdeasHint: string;
  notAvailableYet: string;
  signInToSave: string;
  signIn: string;
  sample: string;
  sampleBanner: string;
  noSections: string;
  noMaterial: string;
  home: string;
  reading: string;
  myNotes: string;
  back: string;
  previous: string;
  next: string;
  markComplete: string;
  completed: string;
  reopen: string;
  bookmark: string;
  bookmarked: string;
  notePlaceholder: string;
  saveNote: string;
  deleteNote: string;
  noteSaved: string;
  noteError: string;
  noNotes: string;
  openSection: string;
  question: string;
  answer: string;
  meaning: string;
  banglaMeaning: string;
  englishMeaning: string;
  loading: string;
  loadError: string;
  notConnected: string;
  sectionWord: string;
}

const en: StudyStrings = {
  studyCentre: 'Study centre',
  yourStudyCentre: 'Your study centre',
  exploreEssay: 'Explore the text through independent resources or guided reading.',
  continueLearning: 'Continue learning',
  currentSection: 'Your current section',
  readingProgress: 'Reading progress',
  continueReading: 'Continue reading',
  startReading: 'Start reading',
  studyResources: 'Study resources',
  structure: 'Structure',
  sectionsWord: 'sections',
  resourceNames: {
    ORIGINAL_TEXT: 'Original Text',
    BANGLA_EXPLANATION: 'Bangla Explanation',
    SUMMARY: 'Summary',
    CRITICAL_ANALYSIS: 'Critical Analysis',
    QUOTATION: 'Important Quotations',
    QUESTION_ANSWER: 'Questions & Answers',
    VOCABULARY: 'Vocabulary',
    NOTES: 'My Study Notes',
  },
  resourceHints: {
    ORIGINAL_TEXT: 'Read the original text',
    BANGLA_EXPLANATION: 'Understand every passage',
    SUMMARY: 'Short and detailed summary',
    CRITICAL_ANALYSIS: 'Themes and interpretation',
    QUOTATION: 'Memorable lines and meanings',
    QUESTION_ANSWER: 'Exam preparation',
    VOCABULARY: 'Words and Bangla meanings',
    NOTES: 'Your personal notes',
  },
  centralIdeas: 'Central ideas',
  centralIdeasHint: 'The main ideas of this section',
  notAvailableYet: 'Not available yet',
  signInToSave: 'Sign in to save your progress, bookmarks and notes.',
  signIn: 'Sign in',
  sample: 'Sample content',
  sampleBanner: 'Sample content for testing the screens. This is not real academic material.',
  noSections: 'Study material for this book is not available yet.',
  noMaterial: 'Nothing has been added here yet.',
  home: 'Home',
  reading: 'Reading',
  myNotes: 'My Notes',
  back: 'Back',
  previous: 'Previous',
  next: 'Next',
  markComplete: 'Mark section as complete',
  completed: 'Completed',
  reopen: 'Mark as not complete',
  bookmark: 'Bookmark',
  bookmarked: 'Bookmarked',
  notePlaceholder: 'Write your own note for this section…',
  saveNote: 'Save note',
  deleteNote: 'Delete note',
  noteSaved: 'Saved',
  noteError: 'Could not save. Please try again.',
  noNotes: 'You have no notes for this book yet.',
  openSection: 'Open section',
  question: 'Question',
  answer: 'Answer',
  meaning: 'Meaning',
  banglaMeaning: 'Bangla',
  englishMeaning: 'English',
  loading: 'Loading…',
  loadError: 'Could not load this page.',
  notConnected: 'The website is not connected to the server yet.',
  sectionWord: 'Section',
};

// First draft; needs review by a Bangla-speaking academic reviewer.
const bn: StudyStrings = {
  studyCentre: 'স্টাডি সেন্টার',
  yourStudyCentre: 'আপনার স্টাডি সেন্টার',
  exploreEssay: 'আলাদা রিসোর্স বা ধাপে ধাপে পাঠের মাধ্যমে পাঠটি আয়ত্ত করুন।',
  continueLearning: 'পড়া চালিয়ে যান',
  currentSection: 'আপনার বর্তমান অংশ',
  readingProgress: 'পড়ার অগ্রগতি',
  continueReading: 'পড়া চালিয়ে যান',
  startReading: 'পড়া শুরু করুন',
  studyResources: 'পাঠ-সহায়ক রিসোর্স',
  structure: 'কাঠামো',
  sectionsWord: 'অংশ',
  resourceNames: {
    ORIGINAL_TEXT: 'মূল পাঠ',
    BANGLA_EXPLANATION: 'বাংলা ব্যাখ্যা',
    SUMMARY: 'সারসংক্ষেপ',
    CRITICAL_ANALYSIS: 'সমালোচনামূলক বিশ্লেষণ',
    QUOTATION: 'গুরুত্বপূর্ণ উদ্ধৃতি',
    QUESTION_ANSWER: 'প্রশ্ন ও উত্তর',
    VOCABULARY: 'শব্দভান্ডার',
    NOTES: 'আমার নোট',
  },
  resourceHints: {
    ORIGINAL_TEXT: 'মূল পাঠ পড়ুন',
    BANGLA_EXPLANATION: 'প্রতিটি অংশ বুঝুন',
    SUMMARY: 'সংক্ষিপ্ত ও বিস্তারিত সারাংশ',
    CRITICAL_ANALYSIS: 'বিষয়বস্তু ও ব্যাখ্যা',
    QUOTATION: 'স্মরণীয় লাইন ও অর্থ',
    QUESTION_ANSWER: 'পরীক্ষার প্রস্তুতি',
    VOCABULARY: 'শব্দ ও বাংলা অর্থ',
    NOTES: 'আপনার ব্যক্তিগত নোট',
  },
  centralIdeas: 'মূল ভাবনা',
  centralIdeasHint: 'এই অংশের প্রধান ভাবনা',
  notAvailableYet: 'এখনো পাওয়া যায়নি',
  signInToSave: 'অগ্রগতি, বুকমার্ক ও নোট সংরক্ষণ করতে সাইন ইন করুন।',
  signIn: 'সাইন ইন',
  sample: 'নমুনা বিষয়বস্তু',
  sampleBanner: 'পর্দা পরীক্ষার জন্য নমুনা বিষয়বস্তু। এটি প্রকৃত একাডেমিক উপকরণ নয়।',
  noSections: 'এই বইয়ের পাঠ-উপকরণ এখনো পাওয়া যায়নি।',
  noMaterial: 'এখানে এখনো কিছু যোগ করা হয়নি।',
  home: 'হোম',
  reading: 'পাঠ',
  myNotes: 'আমার নোট',
  back: 'পিছনে',
  previous: 'আগের',
  next: 'পরের',
  markComplete: 'অংশটি সম্পন্ন হিসেবে চিহ্নিত করুন',
  completed: 'সম্পন্ন',
  reopen: 'সম্পন্ন চিহ্ন তুলে নিন',
  bookmark: 'বুকমার্ক',
  bookmarked: 'বুকমার্ক করা হয়েছে',
  notePlaceholder: 'এই অংশের জন্য আপনার নিজের নোট লিখুন…',
  saveNote: 'নোট সংরক্ষণ',
  deleteNote: 'নোট মুছুন',
  noteSaved: 'সংরক্ষিত',
  noteError: 'সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।',
  noNotes: 'এই বইয়ের জন্য আপনার কোনো নোট নেই।',
  openSection: 'অংশটি খুলুন',
  question: 'প্রশ্ন',
  answer: 'উত্তর',
  meaning: 'অর্থ',
  banglaMeaning: 'বাংলা',
  englishMeaning: 'ইংরেজি',
  loading: 'লোড হচ্ছে…',
  loadError: 'পাতাটি লোড করা যায়নি।',
  notConnected: 'ওয়েবসাইট এখনো সার্ভারের সাথে যুক্ত নয়।',
  sectionWord: 'অংশ',
};

export const STUDY_TEXT: Record<SupportedLanguage, StudyStrings> = { en, bn };
