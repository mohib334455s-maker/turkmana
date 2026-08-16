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

export function dualDateLabel(date: Date = new Date()) {
  return {
    jalali: formatJalali(date),
    gregorian: formatGregorian(date),
    jalaliLong: formatJalaliLong(date),
    gregorianLong: formatGregorianLong(date),
  };
}
