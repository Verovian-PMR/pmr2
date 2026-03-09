"use client";

import { useState, useRef, useCallback } from "react";

interface ImageDropzoneProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
  accept?: string;
  maxSizeMb?: number;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ImageDropzone({
  label,
  value,
  onChange,
  hint = "PNG, JPG, WebP or SVG — max 5 MB",
  accept = "image/png,image/jpeg,image/webp,image/svg+xml",
  maxSizeMb = 5,
}: ImageDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);

      // Validate type
      const allowed = accept.split(",").map((t) => t.trim());
      if (!allowed.includes(file.type)) {
        setError("Unsupported file type.");
        return;
      }

      // Validate size
      if (file.size > maxSizeMb * 1024 * 1024) {
        setError(`File exceeds ${maxSizeMb} MB limit.`);
        return;
      }

      // Convert to base64 data URL so it persists in localStorage across reloads
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setPreview(dataUrl);
        setFileName(file.name);
        setFileSize(file.size);
        onChange(dataUrl);
      };
      reader.readAsDataURL(file);
    },
    [accept, maxSizeMb, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleRemove = useCallback(() => {
    setPreview(null);
    setFileName(null);
    setFileSize(null);
    setError(null);
    onChange("");
    if (inputRef.current) inputRef.current.value = "";
  }, [preview, onChange]);

  const hasPreview = preview || (value && value.length > 0);
  const displayUrl = preview || value;

  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-1.5">{label}</label>

      {hasPreview ? (
        /* ── Preview state ── */
        <div className="relative border border-neutral-200 rounded-xl overflow-hidden bg-neutral-50">
          <div className="flex items-center gap-4 p-3">
            <div className="w-20 h-20 rounded-lg bg-white border border-neutral-200 overflow-hidden shrink-0 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={displayUrl}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              {fileName ? (
                <>
                  <p className="text-sm font-medium text-neutral-800 truncate">{fileName}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">{fileSize ? formatBytes(fileSize) : ""}</p>
                </>
              ) : (
                <p className="text-sm text-neutral-500 truncate">{value}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-medium text-primary-600 hover:bg-primary-50 transition-colors"
              title="Change image"
            >
              Change
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="shrink-0 p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Remove"
            >
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleInputChange}
            className="hidden"
          />
        </div>
      ) : showUrlInput ? (
        /* ── URL input mode ── */
        <div>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://..."
            className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowUrlInput(false)}
            className="text-xs text-primary-600 hover:text-primary-700 mt-1.5 font-medium"
          >
            Switch to file upload
          </button>
        </div>
      ) : (
        /* ── Dropzone ── */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`
            relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200
            ${isDragOver
              ? "border-primary-400 bg-primary-50/50"
              : "border-neutral-300 bg-neutral-50/50 hover:border-primary-300 hover:bg-primary-50/30"
            }
          `}
        >
          <div className="flex flex-col items-center justify-center py-8 px-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                isDragOver ? "bg-primary-100 text-primary-600" : "bg-neutral-100 text-neutral-400"
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-neutral-700">
              {isDragOver ? "Drop your image here" : "Drag & drop or click to browse"}
            </p>
            <p className="text-xs text-neutral-400 mt-1">{hint}</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleInputChange}
            className="hidden"
          />
        </div>
      )}

      {/* URL toggle */}
      {!hasPreview && !showUrlInput && (
        <button
          type="button"
          onClick={() => setShowUrlInput(true)}
          className="text-xs text-neutral-500 hover:text-primary-600 mt-1.5 font-medium transition-colors"
        >
          Or paste a URL instead
        </button>
      )}

      {error && <p className="text-xs text-red-600 mt-1.5">{error}</p>}
    </div>
  );
}
