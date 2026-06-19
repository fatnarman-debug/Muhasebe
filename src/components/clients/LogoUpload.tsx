"use client";

import { useState, useRef } from "react";
import { uploadLogo } from "@/app/actions/upload";
import { Loader2, Upload, X, ImageIcon } from "lucide-react";

interface Props {
  companyId?: string;
  currentUrl?: string | null;
  onUploaded: (url: string) => void;
}

export function LogoUpload({ companyId, currentUrl, onUploaded }: Props) {
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError("");
    setLoading(true);

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    const fd = new FormData();
    fd.append("file", file);
    if (companyId) fd.append("companyId", companyId);

    const result = await uploadLogo(fd);
    setLoading(false);

    if ("error" in result) {
      setError(result.error);
      setPreview(currentUrl ?? null);
    } else {
      onUploaded(result.url);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function clear() {
    setPreview(null);
    onUploaded("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="relative inline-block">
          <img
            src={preview}
            alt="Företagslogotyp"
            className="h-20 max-w-[200px] object-contain rounded-lg border border-gray-200 bg-white p-2"
          />
          <button
            type="button"
            onClick={clear}
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
          {loading && (
            <div className="absolute inset-0 bg-white/70 rounded-lg flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            </div>
          )}
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center w-48 h-24 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
        >
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          ) : (
            <>
              <ImageIcon className="w-6 h-6 text-gray-300 mb-1" />
              <p className="text-xs text-gray-400 text-center">Dra hit eller klicka</p>
              <p className="text-xs text-gray-300">PNG, JPG, SVG · max 2 MB</p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        onChange={handleChange}
        className="hidden"
      />

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
