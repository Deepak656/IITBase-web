'use client';

import { useRef, useState } from 'react';

interface PhotoUploadProps {
  photoUrl?: string;
  fullName?: string;
  email: string;
  onUpload: (file: File) => Promise<void>;
  uploading: boolean;
}

export default function PhotoUpload({
  photoUrl,
  fullName,
  email,
  onUpload,
  uploading,
}: PhotoUploadProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const initial = fullName ? fullName[0].toUpperCase() : email[0].toUpperCase();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) onUpload(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
    e.target.value = '';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <h3
        className="text-sm font-semibold text-gray-900 mb-3"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        Profile photo
      </h3>

      <div className="flex items-center gap-4">
        {/* Preview */}
        <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-teal-100 to-cyan-100 border-2 border-gray-200 flex-shrink-0">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={fullName ?? 'Profile'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span
                className="text-xl font-semibold text-teal-600"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {initial}
              </span>
            </div>
          )}
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex-1 border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
            dragging
              ? 'border-teal-400 bg-teal-50'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-gray-500">Uploading…</p>
            </div>
          ) : (
            <>
              <svg
                className="w-6 h-6 text-gray-300 mx-auto mb-1.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <p className="text-xs text-gray-500">Drop image or click to browse</p>
              <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, WebP · Max 5 MB</p>
            </>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}