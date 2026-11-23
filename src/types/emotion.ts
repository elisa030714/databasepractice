import type { Timestamp } from 'firebase/firestore';

export type EmotionType = '행복' | '평온' | '불안' | '슬픔' | '화남' | '피곤';

export interface EmotionMeta {
  type: EmotionType;
  emoji: string;
  label: string;
  description: string;
  color: string;       // Primary pastel color
  borderColor: string; // Border accent color
  bgLight: string;     // Soft background tint
  textColor: string;   // Contrast text color
}

export const EMOTIONS: Record<EmotionType, EmotionMeta> = {
  행복: {
    type: '행복',
    emoji: '😊',
    label: '행복해요',
    description: '기분 좋은 일이 있거나 신나요!',
    color: '#FDE047',
    borderColor: '#FACC15',
    bgLight: '#FEF9C3',
    textColor: '#854D0E',
  },
  평온: {
    type: '평온',
    emoji: '🌿',
    label: '평온해요',
    description: '마음이 차분하고 편안해요.',
    color: '#86EFAC',
    borderColor: '#4ADE80',
    bgLight: '#DCFCE7',
    textColor: '#166534',
  },
  불안: {
    type: '불안',
    emoji: '💭',
    label: '불안해요',
    description: '걱정되거나 마음이 두근거려요.',
    color: '#C4B5FD',
    borderColor: '#A78BFA',
    bgLight: '#EDE9FE',
    textColor: '#5B21B6',
  },
  슬픔: {
    type: '슬픔',
    emoji: '💧',
    label: '슬퍼요',
    description: '눈물이 날 것 같거나 외로워요.',
    color: '#93C5FD',
    borderColor: '#60A5FA',
    bgLight: '#DBEAFE',
    textColor: '#1E40AF',
  },
  화남: {
    type: '화남',
    emoji: '🌋',
    label: '화나요',
    description: '속상하거나 마음이 부글부글해요.',
    color: '#FCA5A5',
    borderColor: '#F87171',
    bgLight: '#FEE2E2',
    textColor: '#991B1B',
  },
  피곤: {
    type: '피곤',
    emoji: '🌙',
    label: '피곤해요',
    description: '기운이 없고 쉬고 싶어요.',
    color: '#E2E8F0',
    borderColor: '#CBD5E1',
    bgLight: '#F1F5F9',
    textColor: '#475569',
  },
};

export interface StudentEmotionRecord {
  id?: string;
  studentName: string;
  emotion: EmotionType;
  imageUrl: string;
  createdAt: Timestamp | Date | { seconds: number; nanoseconds: number } | string;
}
