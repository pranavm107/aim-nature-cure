import React from 'react';
import { Upload } from 'lucide-react';

export const InputField = ({ label, type = "text", name, value, onChange, placeholder, required = false, className = "", disabled = false }) => (
  <div className={`flex-1 flex flex-col gap-1.5 ${className}`}>
    <label className="text-sm font-medium text-slate-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input 
      name={name}
      onChange={onChange} 
      value={value} 
      disabled={disabled}
      className='bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 rounded-md px-3 py-2 shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all disabled:opacity-50 disabled:bg-slate-50' 
      type={type} 
      placeholder={placeholder} 
      required={required} 
    />
  </div>
);

export const SelectField = ({ label, name, value, onChange, options, required = false, className = "", disabled = false }) => (
  <div className={`flex-1 flex flex-col gap-1.5 ${className}`}>
    <label className="text-sm font-medium text-slate-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select 
      name={name}
      onChange={onChange} 
      value={value}
      disabled={disabled} 
      className='bg-white border border-slate-300 text-slate-900 rounded-md px-3 py-2 shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all disabled:opacity-50 disabled:bg-slate-50'
      required={required}
    >
      <option value="" disabled>Select {label}</option>
      {options.map((opt, i) => (
        <option key={i} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

export const TextareaField = ({ label, name, value, onChange, placeholder, rows = 5, required = false, className = "", disabled = false }) => (
  <div className={`w-full flex flex-col gap-1.5 ${className}`}>
    <label className="text-sm font-medium text-slate-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <textarea 
      name={name}
      onChange={onChange} 
      value={value}
      disabled={disabled} 
      className='bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 rounded-md px-3 py-2 shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all disabled:opacity-50 disabled:bg-slate-50' 
      rows={rows} 
      placeholder={placeholder}
      required={required}
    />
  </div>
);

export const ImageUploadField = ({ label, image, onChange, placeholderImg }) => (
  <div className='flex items-center gap-4 text-slate-600 mb-8'>
    <label htmlFor="image-upload" className="cursor-pointer group relative">
      <img 
        className='w-16 h-16 bg-slate-100 rounded-full object-cover border-2 border-slate-200 group-hover:border-primary transition-colors' 
        src={image ? URL.createObjectURL(image) : placeholderImg} 
        alt="Upload" 
      />
      <div className="absolute inset-0 bg-slate-900/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <Upload className="w-5 h-5 text-white" />
      </div>
    </label>
    <input onChange={(e) => onChange(e.target.files[0])} type="file" id="image-upload" hidden accept="image/*" />
    <span className="text-sm font-medium">{label}</span>
  </div>
);

export const PrimaryButton = ({ type = "button", children, onClick, className = "", disabled = false }) => (
  <button 
    type={type} 
    onClick={onClick}
    disabled={disabled}
    className={`bg-primary text-white hover:bg-primary/90 shadow-sm rounded-md px-4 py-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
  >
    {children}
  </button>
);

export const SecondaryButton = ({ type = "button", children, onClick, className = "", disabled = false }) => (
  <button 
    type={type} 
    onClick={onClick}
    disabled={disabled}
    className={`bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 shadow-sm rounded-md px-4 py-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
  >
    {children}
  </button>
);

export const DangerButton = ({ type = "button", children, onClick, className = "", disabled = false }) => (
  <button 
    type={type} 
    onClick={onClick}
    disabled={disabled}
    className={`bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 shadow-sm rounded-md px-4 py-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
  >
    {children}
  </button>
);
