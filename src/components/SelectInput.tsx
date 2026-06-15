import React from 'react';

interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
}

export default function SelectInput({ label, options, className = "", ...props }: SelectInputProps) {
  return (
    <div className={className}>
      <label htmlFor={props.id} className="block text-sm md:text-base font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <select
          {...props}
          className="appearance-none w-full border border-gray-300 bg-white rounded-md shadow-sm focus:ring-2 focus:ring-primary focus:border-primary p-3 md:p-3.5 text-base text-gray-900 font-medium hover:border-gray-400 transition-colors pr-4 pl-10"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="text-gray-900 font-medium">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-3 text-gray-700">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
