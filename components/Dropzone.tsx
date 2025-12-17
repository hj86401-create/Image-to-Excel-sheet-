import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface DropzoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

const Dropzone: React.FC<DropzoneProps> = ({ onFileSelect, disabled }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const validateAndSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError("Please upload an image file (PNG, JPG, WebP).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError("File size too large. Max 10MB.");
      return;
    }
    setError(null);
    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSelect(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative w-full cursor-pointer flex flex-col items-center justify-center 
          rounded-xl border-2 border-dashed transition-all duration-200 p-12
          ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200' : ''}
          ${isDragOver 
            ? 'border-indigo-500 bg-indigo-50/50 scale-[1.01]' 
            : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50 bg-white'}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleChange}
          disabled={disabled}
        />
        
        <div className="bg-indigo-50 p-4 rounded-full mb-4">
          <UploadCloud className={`w-8 h-8 text-indigo-600 ${isDragOver ? 'animate-bounce' : ''}`} />
        </div>
        
        <h3 className="text-lg font-semibold text-slate-800 mb-1">
          Click or drag image to upload
        </h3>
        <p className="text-sm text-slate-500 mb-4">
          Support for PNG, JPG, and WEBP (Max 10MB)
        </p>

        {/* Example hint */}
        <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
          <ImageIcon className="w-3 h-3" />
          <span>Receipts, invoices, or tables work best</span>
        </div>
      </div>

      {error && (
        <div className="mt-3 flex items-center text-sm text-red-600 bg-red-50 p-3 rounded-lg animate-fadeIn">
          <AlertCircle className="w-4 h-4 mr-2" />
          {error}
        </div>
      )}
    </div>
  );
};

export default Dropzone;
