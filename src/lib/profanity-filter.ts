/**
 * Profanity Filter System
 * ระบบตรวจสอบและกรองคำหยาบคาย
 */

import fs from 'fs';
import path from 'path';

export interface ProfanityCheckResult {
  isClean: boolean;
  foundWords: string[];
  filteredText: string;
  severity: 'none' | 'mild' | 'moderate' | 'severe';
}

// โหลดคำหยาบจากไฟล์
function loadProfanityWords(): string[] {
  try {
    const filePath = path.join(process.cwd(), 'src/lib/profanity-words.json');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    return data.words || [];
  } catch (error) {
    console.error('Error loading profanity words:', error);
    return [];
  }
}

export class ProfanityFilter {
  private words: Set<string>;
  private patterns: RegExp[];

  constructor() {
    const profanityWords = loadProfanityWords();
    this.words = new Set(profanityWords.map(w => w.toLowerCase()));
    this.patterns = this.buildPatterns();
    console.log(`Profanity filter initialized with ${this.words.size} words`);
  }

  /**
   * สร้าง regex patterns สำหรับตรวจจับคำหยาบที่มีการแทรกตัวอักษร
   */
  private buildPatterns(): RegExp[] {
    const patterns: RegExp[] = [];
    
    // สร้าง pattern สำหรับแต่ละคำ
    Array.from(this.words).forEach(word => {
      if (word.length < 3) return; // ข้ามคำที่สั้นเกินไป
      
      // Pattern 1: คำที่มีการแทรกตัวอักษรพิเศษ เช่น s@d, sh!t
      const specialChars = word.replace(/[aeiou]/gi, (match) => {
        const replacements: Record<string, string> = {
          'a': '[a@4]',
          'e': '[e3]',
          'i': '[i1!]',
          'o': '[o0]',
          'u': '[u]',
          'A': '[A@4]',
          'E': '[E3]',
          'I': '[I1!]',
          'O': '[O0]',
          'U': '[U]'
        };
        return replacements[match] || match;
      });
      
      // Pattern 2: คำที่มีการแทรกช่องว่างหรือขีด เช่น s h i t, s-h-i-t
      const withSpaces = word.split('').join('[\\s\\-_]*');
      
      // Pattern 3: คำที่มีตัวอักษรซ้ำ เช่น fuckk, shiiit
      const withRepeats = word.split('').map(char => {
        if (/[a-z]/i.test(char)) {
          return `${char}+`; // อนุญาตให้ตัวอักษรซ้ำได้
        }
        return char;
      }).join('');
      
      patterns.push(
        new RegExp(`\\b${specialChars}\\b`, 'gi'),
        new RegExp(`\\b${withSpaces}\\b`, 'gi'),
        new RegExp(`\\b${withRepeats}\\b`, 'gi')
      );
    });

    return patterns;
  }

  /**
   * ตรวจสอบข้อความว่ามีคำหยาบหรือไม่
   */
  check(text: string): ProfanityCheckResult {
    const foundWords: string[] = [];
    const lowerText = text.toLowerCase();

    // ตรวจสอบคำที่ตรงทุกประการ
    const words = lowerText.split(/\s+/);
    words.forEach(word => {
      const cleanWord = word.replace(/[^\w\u0E00-\u0E7F]/g, '');
      if (this.words.has(cleanWord)) {
        foundWords.push(cleanWord);
      }
    });

    // ตรวจสอบด้วย patterns
    this.patterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        foundWords.push(...matches.map(m => m.toLowerCase()));
      }
    });

    // กำจัดคำซ้ำ
    const uniqueWords = [...new Set(foundWords)];

    // กำหนดระดับความรุนแรง
    let severity: 'none' | 'mild' | 'moderate' | 'severe' = 'none';
    if (uniqueWords.length > 0) {
      if (uniqueWords.length >= 5) {
        severity = 'severe';
      } else if (uniqueWords.length >= 3) {
        severity = 'moderate';
      } else {
        severity = 'mild';
      }
    }

    return {
      isClean: uniqueWords.length === 0,
      foundWords: uniqueWords,
      filteredText: this.filter(text),
      severity
    };
  }

  /**
   * กรองคำหยาบออกจากข้อความ
   */
  filter(text: string, replacement: string = '***'): string {
    let filtered = text;

    // แทนที่คำที่ตรงทุกประการ
    this.words.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      filtered = filtered.replace(regex, replacement);
    });

    // แทนที่คำที่ตรงตาม patterns
    this.patterns.forEach(pattern => {
      filtered = filtered.replace(pattern, replacement);
    });

    return filtered;
  }

  /**
   * เพิ่มคำใหม่เข้าระบบ (สำหรับ admin)
   */
  addWord(word: string): void {
    this.words.add(word.toLowerCase());
    this.patterns = this.buildPatterns();
  }

  /**
   * ลบคำออกจากระบบ (สำหรับ admin)
   */
  removeWord(word: string): void {
    this.words.delete(word.toLowerCase());
    this.patterns = this.buildPatterns();
  }

  /**
   * ดึงรายการคำทั้งหมด
   */
  getWords(): string[] {
    return Array.from(this.words);
  }

  /**
   * ตรวจสอบว่าข้อความมีความยาวเหมาะสมหรือไม่
   */
  validateLength(text: string, min: number = 10, max: number = 5000): {
    isValid: boolean;
    message?: string;
  } {
    const length = text.trim().length;
    
    if (length < min) {
      return {
        isValid: false,
        message: `ข้อความต้องมีอย่างน้อย ${min} ตัวอักษร`
      };
    }
    
    if (length > max) {
      return {
        isValid: false,
        message: `ข้อความต้องไม่เกิน ${max} ตัวอักษร`
      };
    }
    
    return { isValid: true };
  }

  /**
   * ตรวจสอบ spam (ข้อความซ้ำๆ, ตัวอักษรซ้ำๆ)
   */
  checkSpam(text: string): {
    isSpam: boolean;
    reason?: string;
  } {
    // ตรวจสอบตัวอักษรซ้ำติดกันมากกว่า 5 ตัว
    if (/(.)\1{5,}/.test(text)) {
      return {
        isSpam: true,
        reason: 'มีตัวอักษรซ้ำติดกันมากเกินไป'
      };
    }

    // ตรวจสอบตัวพิมพ์ใหญ่มากเกินไป (มากกว่า 70%)
    const upperCount = (text.match(/[A-Z]/g) || []).length;
    const letterCount = (text.match(/[A-Za-z]/g) || []).length;
    if (letterCount > 10 && upperCount / letterCount > 0.7) {
      return {
        isSpam: true,
        reason: 'ใช้ตัวพิมพ์ใหญ่มากเกินไป'
      };
    }

    // ตรวจสอบ URL มากเกินไป
    const urlCount = (text.match(/https?:\/\/[^\s]+/g) || []).length;
    if (urlCount > 3) {
      return {
        isSpam: true,
        reason: 'มี URL มากเกินไป'
      };
    }

    return { isSpam: false };
  }

  /**
   * ตรวจสอบข้อความแบบครบวงจร
   */
  validate(text: string, options?: {
    checkProfanity?: boolean;
    checkSpam?: boolean;
    checkLength?: boolean;
    minLength?: number;
    maxLength?: number;
  }): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    profanityResult?: ProfanityCheckResult;
  } {
    const opts = {
      checkProfanity: true,
      checkSpam: true,
      checkLength: true,
      minLength: 10,
      maxLength: 5000,
      ...options
    };

    const errors: string[] = [];
    const warnings: string[] = [];
    let profanityResult: ProfanityCheckResult | undefined;

    // ตรวจสอบความยาว
    if (opts.checkLength) {
      const lengthCheck = this.validateLength(text, opts.minLength, opts.maxLength);
      if (!lengthCheck.isValid && lengthCheck.message) {
        errors.push(lengthCheck.message);
      }
    }

    // ตรวจสอบคำหยาบ
    if (opts.checkProfanity) {
      profanityResult = this.check(text);
      if (!profanityResult.isClean) {
        // Block ทุก severity ที่มีคำหยาบ
        if (profanityResult.severity === 'severe') {
          errors.push('พบคำหยาบคายมากเกินไป กรุณาแก้ไขข้อความ');
        } else if (profanityResult.severity === 'moderate') {
          errors.push('พบคำหยาบคาย กรุณาใช้ภาษาที่สุภาพ');
        } else {
          // เปลี่ยนจาก warning เป็น error
          errors.push('พบคำที่ไม่เหมาะสม กรุณาใช้ภาษาที่สุภาพ');
        }
      }
    }

    // ตรวจสอบ spam
    if (opts.checkSpam) {
      const spamCheck = this.checkSpam(text);
      if (spamCheck.isSpam) {
        errors.push(spamCheck.reason || 'ข้อความมีลักษณะเป็น spam');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      profanityResult
    };
  }
}

// Export singleton instance
export const profanityFilter = new ProfanityFilter();
