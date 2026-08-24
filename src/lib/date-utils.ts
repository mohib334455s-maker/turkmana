/** Dual calendar helpers — Jalali (Shamsi) + Gregorian */

export function formatJalali(date: Date = new Date()) {
  try {
    return new Intl.DateTimeFormat('fa-AF-u-ca-persian', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  }
}

export function formatGregorian(date: Date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function formatJalaliLong(date: Date = new Date()) {
  try {
    return new Intl.DateTimeFormat('fa-AF-u-ca-persian', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch {
    return formatJalali(date);
  }
}

export function formatGregorianLong(date: Date = new Date()) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatJalaliWeekday(date: Date = new Date()) {
  try {
    return new Intl.DateTimeFormat('fa-AF-u-ca-persian', { weekday: 'long' }).format(date);
  } catch {
    return new Intl.DateTimeFormat('fa-IR-u-ca-persian', { weekday: 'long' }).format(date);
  }
}

export function parseIsoDate(iso: string) {
  const d = new Date(`${iso}T12:00:00`);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

export function gregorianFromIso(iso: string) {
  return formatGregorian(parseIsoDate(iso));
}

export function dualDateLabel(date: Date = new Date()) {
  return {
    jalali: formatJalali(date),
    gregorian: formatGregorian(date),
    jalaliLong: formatJalaliLong(date),
    gregorianLong: formatGregorianLong(date),
  };
}

export type CalendarType = 'jalali' | 'gregorian';

/** Primary date for UI based on settings preference. */
export function formatPreferredDate(
  date: Date = new Date(),
  calendar: CalendarType = 'jalali',
  long = false
) {
  if (calendar === 'gregorian') {
    return long ? formatGregorianLong(date) : formatGregorian(date);
  }
  return long ? formatJalaliLong(date) : formatJalali(date);
}

/** Secondary (other calendar) date for dual display. */
export function formatSecondaryDate(
  date: Date = new Date(),
  calendar: CalendarType = 'jalali'
) {
  return calendar === 'gregorian' ? formatJalali(date) : formatGregorian(date);
}
