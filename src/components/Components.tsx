import React from "react";
import { twMerge } from "tailwind-merge";
import type { GrammarTable } from "../types";

// Button
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "outline";
}
export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  className,
  ...props
}) => {
  const styles = {
    primary:
      "bg-brand text-white shadow-[0_4px_0_0_var(--color-brand-dark)] active:translate-y-1 active:shadow-none",
    secondary:
      "bg-brand-light text-black shadow-[0_4px_0_0_#d4b200] active:translate-y-1 active:shadow-none",
    danger:
      "bg-red-500 text-white shadow-[0_4px_0_0_#991b1b] active:translate-y-1 active:shadow-none",
    outline: "border-2 border-gray-200 text-gray-500 hover:bg-gray-50",
  };
  return (
    <button
      className={twMerge(
        "px-6 py-3 rounded-xl font-bold uppercase tracking-wide transition-all w-full sm:w-auto",
        styles[variant],
        className,
      )}
      {...props}
    />
  );
};

// Grammar Table
export const TableDisplay: React.FC<{ data: GrammarTable }> = ({ data }) => (
  <div className="my-6 border border-gray-200 rounded-xl overflow-hidden">
    <div className="bg-gray-100 p-3 font-bold text-center text-gray-700 border-b border-gray-200">
      {data.title}
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
          <tr>
            {data.headers.map((h, i) => (
              <th key={i} className="px-4 py-2">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.rows.map((row, i) => (
            <tr key={i} className="bg-white hover:bg-gray-50">
              {row.map((c, j) => (
                <td key={j} className="px-4 py-3 font-medium text-gray-800">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Progress
export const ProgressBar: React.FC<{ current: number; total: number }> = ({
  current,
  total,
}) => (
  <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
    <div
      className="h-full bg-brand transition-all duration-500"
      style={{ width: `${(current / total) * 100}%` }}
    />
  </div>
);
