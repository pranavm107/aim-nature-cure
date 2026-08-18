import React from 'react';

export const InputField = ({ label, type = "text", name, value, onChange, placeholder, required = false, className = "" }) => (
  <div className={`flex-1 flex flex-col gap-1 ${className}`}>
    <p>{label} {required && <span className="text-red-500">*</span>}</p>
    <input 
      name={name}
      onChange={onChange} 
      value={value} 
      className='border rounded px-3 py-2 outline-none focus:border-primary transition-colors' 
      type={type} 
      placeholder={placeholder} 
      required={required} 
    />
  </div>
);

export const SelectField = ({ label, name, value, onChange, options, required = false, className = "" }) => (
  <div className={`flex-1 flex flex-col gap-1 ${className}`}>
    <p>{label} {required && <span className="text-red-500">*</span>}</p>
    <select 
      name={name}
      onChange={onChange} 
      value={value} 
      className='border rounded px-3 py-2 outline-none focus:border-primary transition-colors bg-white'
      required={required}
    >
      {options.map((opt, i) => (
        <option key={i} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

export const TextareaField = ({ label, name, value, onChange, placeholder, rows = 5, required = false, className = "" }) => (
  <div className={`w-full flex flex-col gap-1 ${className}`}>
    <p>{label} {required && <span className="text-red-500">*</span>}</p>
    <textarea 
      name={name}
      onChange={onChange} 
      value={value} 
      className='w-full px-4 pt-2 border rounded outline-none focus:border-primary transition-colors' 
      rows={rows} 
      placeholder={placeholder}
      required={required}
    />
  </div>
);

export const ImageUploadField = ({ label, image, onChange, placeholderImg }) => (
  <div className='flex items-center gap-4 text-gray-500 mb-8'>
    <label htmlFor="image-upload" className="cursor-pointer group relative">
      <img 
        className='w-16 h-16 bg-gray-100 rounded-full object-cover border-2 border-transparent group-hover:border-primary transition-colors' 
        src={image ? URL.createObjectURL(image) : placeholderImg} 
        alt="Upload" 
      />
      <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-white">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
        </svg>
      </div>
    </label>
    <input onChange={(e) => onChange(e.target.files[0])} type="file" id="image-upload" hidden accept="image/*" />
    <p>{label}</p>
  </div>
);

export const PrimaryButton = ({ type = "button", children, onClick, className = "", disabled = false }) => (
  <button 
    type={type} 
    onClick={onClick}
    disabled={disabled}
    className={`bg-primary px-10 py-3 text-white rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
  >
    {children}
  </button>
);
