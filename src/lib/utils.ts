import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date to Thai locale
export function formatDate(date: string | Date, locale: 'th' | 'en' = 'th'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (locale === 'th') {
    return dateObj.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Format relative time
export function formatRelativeTime(date: string | Date, locale: 'th' | 'en' = 'th'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  const intervals = {
    th: {
      year: { value: 31536000, label: 'ปีที่แล้ว' },
      month: { value: 2592000, label: 'เดือนที่แล้ว' },
      week: { value: 604800, label: 'สัปดาห์ที่แล้ว' },
      day: { value: 86400, label: 'วันที่แล้ว' },
      hour: { value: 3600, label: 'ชั่วโมงที่แล้ว' },
      minute: { value: 60, label: 'นาทีที่แล้ว' },
      second: { value: 1, label: 'วินาทีที่แล้ว' }
    },
    en: {
      year: { value: 31536000, label: 'year ago' },
      month: { value: 2592000, label: 'month ago' },
      week: { value: 604800, label: 'week ago' },
      day: { value: 86400, label: 'day ago' },
      hour: { value: 3600, label: 'hour ago' },
      minute: { value: 60, label: 'minute ago' },
      second: { value: 1, label: 'second ago' }
    }
  };

  for (const [key, interval] of Object.entries(intervals[locale])) {
    const count = Math.floor(diffInSeconds / interval.value);
    if (count >= 1) {
      if (locale === 'th') {
        return count === 1 ? interval.label : `${count} ${interval.label}`;
      } else {
        return count === 1 ? `1 ${interval.label}` : `${count} ${interval.label}s`;
      }
    }
  }

  return locale === 'th' ? 'เมื่อสักครู่' : 'just now';
}

// Truncate text
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// Get role display name
export function getRoleDisplayName(role: 's' | 't' | 'a', locale: 'th' | 'en' = 'th'): string {
  const roles = {
    th: {
      s: 'นักศึกษา',
      t: 'อาจารย์',
      a: 'ผู้ดูแลระบบ'
    },
    en: {
      s: 'Student',
      t: 'Teacher',
      a: 'Administrator'
    }
  };

  return roles[locale][role];
}

// Get role color
export function getRoleColor(role: 's' | 't' | 'a'): string {
  const colors = {
    s: 'bg-blue-100 text-blue-800',
    t: 'bg-green-100 text-green-800',
    a: 'bg-purple-100 text-purple-800'
  };

  return colors[role];
}

// Validate email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Generate user ID (รหัสนักศึกษา)
export function generateUserId(): string {
  const currentYear = new Date().getFullYear();
  const yearSuffix = currentYear.toString().slice(-2);
  const randomNumber = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  return `${yearSuffix}${randomNumber}`;
}

// Sleep function for delays
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Get initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}