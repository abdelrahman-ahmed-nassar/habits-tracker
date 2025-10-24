/**
 * Date utility functions
 */

/**
 * Map of English day names to Arabic
 */
const dayNamesArabic: Record<string, string> = {
  Sunday: "الأحد",
  Monday: "الإثنين",
  Tuesday: "الثلاثاء",
  Wednesday: "الأربعاء",
  Thursday: "الخميس",
  Friday: "الجمعة",
  Saturday: "السبت",
};

/**
 * Convert English day name to Arabic
 * @param dayName English day name (e.g., "Monday")
 * @returns Arabic day name (e.g., "الإثنين")
 */
export const getArabicDayName = (dayName: string): string => {
  return dayNamesArabic[dayName] || dayName;
};

/**
 * Map of English month abbreviations to Arabic
 */
const monthNamesArabic: Record<string, string> = {
  Jan: "يناير",
  Feb: "فبراير",
  Mar: "مارس",
  Apr: "أبريل",
  May: "مايو",
  Jun: "يونيو",
  Jul: "يوليو",
  Aug: "أغسطس",
  Sep: "سبتمبر",
  Oct: "أكتوبر",
  Nov: "نوفمبر",
  Dec: "ديسمبر",
  // Full month names
  January: "يناير",
  February: "فبراير",
  March: "مارس",
  April: "أبريل",
  June: "يونيو",
  July: "يوليو",
  August: "أغسطس",
  September: "سبتمبر",
  October: "أكتوبر",
  November: "نوفمبر",
  December: "ديسمبر",
};

/**
 * Convert English month abbreviation to Arabic
 * @param monthName English month abbreviation (e.g., "Jan") or full name (e.g., "January")
 * @returns Arabic month name (e.g., "يناير")
 */
export const getArabicMonthName = (monthName: string): string => {
  return monthNamesArabic[monthName] || monthName;
};
