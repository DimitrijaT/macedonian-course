import React from 'react';
import { twMerge } from 'tailwind-merge';
import type { GrammarTable } from '../types';
import { RichText } from './RichText';

// --- BUTTONS ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'locked';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', fullWidth, className, ...props }) => {
  const baseStyles = "py-3 px-6 rounded-2xl font-extrabold uppercase tracking-wider transition-all transform active:translate-y-[4px] active:border-b-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0 disabled:active:border-b-4 touch-manipulation select-none outline-none";
  
  // Chunky borders (border-b-4 or border-b-[6px])
  const variants = {
    primary: "bg-brand text-white border-b-[5px] border-brand-dark hover:bg-brand-light hover:border-brand active:bg-brand-dark shadow-brand/20 shadow-lg",
    secondary: "bg-primary text-white border-b-[5px] border-primary-dark hover:brightness-110 shadow-primary/20 shadow-lg",
    danger: "bg-danger text-white border-b-[5px] border-danger-dark hover:brightness-110 shadow-danger/20 shadow-lg",
    outline: "bg-white text-gray-400 border-2 border-gray-200 border-b-[5px] hover:bg-gray-50 hover:text-gray-600 active:border-b-0",
    locked: "bg-gray-200 text-gray-400 border-b-[5px] border-gray-300 cursor-not-allowed shadow-none"
  };

  return <button className={twMerge(baseStyles, variants[variant], fullWidth && "w-full", className)} {...props} />;
};

// --- CARDS ---
export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={twMerge("bg-white border-2 border-gray-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow", className)}>
    {children}
  </div>
);

// --- GRAMMAR TABLE ---
export const TableDisplay: React.FC<{ data: GrammarTable }> = ({ data }) => (
  <div className="my-8 border-2 border-gray-100 rounded-3xl overflow-hidden bg-white shadow-lg ring-4 ring-gray-50">
    <div className="bg-brand/5 p-4 font-extrabold text-center text-brand-dark border-b-2 border-gray-100 uppercase tracking-widest text-xs">
      {data.title}
    </div>
    <div className="overflow-x-auto no-scrollbar">
      <table className="w-full text-sm text-left min-w-[300px]">
        <thead className="bg-white text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-100">
          <tr>
            {data.headers.map((h, i) => <th key={i} className="px-5 py-3 font-black">{h}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.rows.map((row, i) => (
            <tr key={i} className="hover:bg-blue-50/50 transition-colors group">
              {row.map((c, j) => (
                <td key={j} className="px-5 py-4 font-bold text-gray-700 group-hover:text-gray-900">
                  <RichText text={c} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// --- PROGRESS BAR ---
export const ProgressBar: React.FC<{ current: number; total: number }> = ({ current, total }) => {
  const percentage = Math.min(100, Math.max(0, (current / total) * 100));
  return (
    <div className="w-full h-5 bg-gray-200 rounded-full overflow-hidden relative transform translate-z-0 shadow-inner">
      <div 
        className="h-full bg-brand transition-all duration-500 ease-out rounded-full relative shadow-[0_2px_0_rgba(255,255,255,0.3)_inset]" 
        style={{ width: `${percentage}%` }}
      >
        <div className="absolute top-1 left-2 right-2 h-1.5 bg-white/20 rounded-full" />
      </div>
    </div>
  );
};