'use client';

import { useState, useRef } from 'react';

interface ResumeUploadProps {
  resumeUrl?: string;
  resumeFileName?: string;
  onUpload: (file: File) => Promise<void>;
  uploading: boolean;
}

export default function ResumeUpload({ resumeUrl, resumeFileName, onUpload, uploading }: ResumeUploadProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') onUpload(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
    e.target.value = '';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>Resume</h3>

      {resumeUrl && resumeFileName ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="w-8 h-8 flex items-center justify-center bg-red-50 rounded">
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-700 truncate">{resumeFileName}</p>
              <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-teal-600 hover:underline">
                Preview
              </a>
            </div>
          </div>
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-full px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
          >
            {uploading ? 'Uploading…' : 'Replace resume'}
          </button>
        </div>
      ) : (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors ${
            dragging ? 'border-teal-400 bg-teal-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-gray-500">Uploading…</p>
            </div>
          ) : (
            <>
              <svg className="w-7 h-7 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-xs text-gray-500">Drop your PDF here</p>
              <p className="text-xs text-gray-400 mt-0.5">or click to browse · Max 5 MB</p>
            </>
          )}
        </div>
      )}

      <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={handleChange} />
    </div>
  );
}