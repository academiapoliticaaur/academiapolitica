"use client";

import { Link as LinkIcon, X, ExternalLink } from "lucide-react";
import { getLinkLabel } from "@/lib/utils/google-drive";
import { GooglePickerButton } from "@/components/admin/google-picker-button";
import { DriveUploadButton } from "@/components/admin/drive-upload-button";

interface UploadContext {
  lessonId: string;
  courseId: string;
  moduleId: string;
}

interface GoogleDriveLinkFieldProps {
  value?: string;
  onChange: (url: string) => void;
  placeholder?: string;
  hint?: string;
  accept?: "video" | "presentation" | "worksheet" | "any";
  uploadContext?: UploadContext;
  uploadAccept?: string;
  uploadField?: "presentation_url" | "worksheet_url" | "video_url";
}

export function GoogleDriveLinkField({
  value, onChange, placeholder, hint, accept = "any",
  uploadContext, uploadAccept, uploadField,
}: GoogleDriveLinkFieldProps) {
  const hasValue = value?.startsWith("http");

  if (hasValue) {
    return (
      <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <LinkIcon size={16} className="text-blue-600 flex-shrink-0" />
        <span className="text-sm text-blue-700 flex-1 truncate" title={value}>
          {getLinkLabel(value!)} — {value!.length > 45 ? value!.slice(0, 45) + "…" : value}
        </span>
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-600 flex-shrink-0">
          <ExternalLink size={14} />
        </a>
        <button type="button" onClick={() => onChange("")} className="text-gray-400 hover:text-red-500 flex-shrink-0">
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <LinkIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="url"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "https://drive.google.com/file/d/... sau lipește un link"}
          className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>
      <GooglePickerButton
        accept={accept}
        onFilePicked={(file) => onChange(file.url)}
        label="Selectează din Google Drive"
      />
      {uploadContext && uploadField && (
        <DriveUploadButton
          lessonId={uploadContext.lessonId}
          courseId={uploadContext.courseId}
          moduleId={uploadContext.moduleId}
          field={uploadField}
          accept={uploadAccept}
          onUploaded={(url) => onChange(url)}
        />
      )}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}
