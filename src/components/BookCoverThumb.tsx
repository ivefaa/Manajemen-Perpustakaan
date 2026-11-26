import React from 'react';
import type { Book } from '../types/library';

interface BookCoverThumbProps {
  book: Pick<Book, 'id' | 'title' | 'author' | 'coverTone'>;
  size?: 'sm' | 'md' | 'lg';
}

const TONE_MAP: Record<
  Book['coverTone'],
  { bg: string; accent: string; spine: string; text: string }
> = {
  teal: {
    bg: 'from-[#0D6E6E] to-[#083D44]',
    accent: 'bg-teal-300/30',
    spine: 'bg-teal-950/40',
    text: 'text-teal-50',
  },
  navy: {
    bg: 'from-[#172554] to-[#0F172A]',
    accent: 'bg-sky-300/25',
    spine: 'bg-slate-950/50',
    text: 'text-slate-50',
  },
  amber: {
    bg: 'from-[#B45309] to-[#78350F]',
    accent: 'bg-amber-200/30',
    spine: 'bg-amber-950/40',
    text: 'text-amber-50',
  },
  rose: {
    bg: 'from-[#9F1239] to-[#4C0519]',
    accent: 'bg-rose-200/25',
    spine: 'bg-rose-950/45',
    text: 'text-rose-50',
  },
  indigo: {
    bg: 'from-[#3730A3] to-[#1E1B4B]',
    accent: 'bg-indigo-200/25',
    spine: 'bg-indigo-950/45',
    text: 'text-indigo-50',
  },
  emerald: {
    bg: 'from-[#065F46] to-[#022C22]',
    accent: 'bg-emerald-200/25',
    spine: 'bg-emerald-950/45',
    text: 'text-emerald-50',
  },
  slate: {
    bg: 'from-[#334155] to-[#0F172A]',
    accent: 'bg-slate-300/25',
    spine: 'bg-slate-950/50',
    text: 'text-slate-50',
  },
  sky: {
    bg: 'from-[#0369A1] to-[#0C4A6E]',
    accent: 'bg-sky-200/30',
    spine: 'bg-sky-950/45',
    text: 'text-sky-50',
  },
};

export const BookCoverThumb: React.FC<BookCoverThumbProps> = ({
  book,
  size = 'md',
}) => {
  const tone = TONE_MAP[book.coverTone] ?? TONE_MAP.navy;
  const initial = (book.title.trim()[0] || 'B').toUpperCase();

  const dimensions =
    size === 'sm'
      ? 'w-12 h-16 rounded-lg'
      : size === 'lg'
      ? 'w-20 h-26 rounded-xl'
      : 'w-14 h-20 rounded-lg';

  return (
    <div
      className={`relative shrink-0 overflow-hidden bg-gradient-to-br ${tone.bg} ${dimensions} shadow-sm border border-black/10 flex flex-col justify-between p-2 select-none`}
      aria-hidden="true"
    >
      {/* Book spine */}
      <div className={`absolute inset-y-0 left-0 w-1.5 ${tone.spine}`} />
      {/* Subtle geometric motif */}
      <div
        className={`absolute -right-3 -bottom-3 w-10 h-10 rounded-full ${tone.accent}`}
      />
      <div className="relative z-10 flex items-center justify-between pl-1">
        <span className="font-mono text-[8px] font-semibold tracking-tight text-white/75">
          {book.id}
        </span>
      </div>
      <div className="relative z-10 pl-1">
        <div
          className={`font-bold leading-none ${tone.text} ${
            size === 'lg' ? 'text-2xl' : 'text-lg'
          }`}
        >
          {initial}
        </div>
        <div className="mt-1 h-0.5 w-5 rounded-full bg-white/40" />
      </div>
    </div>
  );
};
