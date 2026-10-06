"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type ImageInputProps = {
  id: string;
  label: string;
  labelFor?: string;
  disabled: boolean;
  onFiles: (files: FileList | File[]) => void;
  filename: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function ImageInput({
  id,
  label,
  labelFor = `${id}-image`,
  disabled,
  onFiles,
  filename,
  actions,
  children,
}: ImageInputProps) {
  const picker = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    let depth = 0;
    const isFileDrag = (event: DragEvent) =>
      event.dataTransfer?.types.includes("Files");
    const reset = () => {
      depth = 0;
      setDragging(false);
    };
    const enter = (event: DragEvent) => {
      if (!isFileDrag(event) || disabled) return;
      depth += 1;
      setDragging(true);
    };
    const over = (event: DragEvent) => {
      if (!isFileDrag(event)) return;
      event.preventDefault();
      event.dataTransfer!.dropEffect = disabled ? "none" : "copy";
    };
    const leave = () => {
      depth = Math.max(0, depth - 1);
      if (!depth) setDragging(false);
    };
    const drop = (event: DragEvent) => {
      if (!isFileDrag(event)) return;
      event.preventDefault();
      reset();
      if (!disabled) onFiles(event.dataTransfer!.files);
    };
    const paste = (event: ClipboardEvent) => {
      if (!event.clipboardData?.files.length) return;
      event.preventDefault();
      reset();
      if (!disabled) onFiles(event.clipboardData.files);
    };
    window.addEventListener("dragenter", enter);
    window.addEventListener("dragover", over);
    window.addEventListener("dragleave", leave);
    window.addEventListener("drop", drop);
    window.addEventListener("dragend", reset);
    window.addEventListener("paste", paste);
    return () => {
      window.removeEventListener("dragenter", enter);
      window.removeEventListener("dragover", over);
      window.removeEventListener("dragleave", leave);
      window.removeEventListener("drop", drop);
      window.removeEventListener("dragend", reset);
      window.removeEventListener("paste", paste);
    };
  }, [disabled, onFiles]);

  return (
    <div className="border-base-content/15 relative border-b p-5 sm:p-6">
      <div className="mb-4 flex min-h-5 flex-wrap items-center justify-between gap-3">
        <label
          htmlFor={labelFor}
          className="font-mono text-sm font-bold lowercase"
        >
          {label}
        </label>
        <div className="flex items-center gap-3">
          {actions}
          {actions && <span className="text-base-content/55 text-xs">or</span>}
          <button
            type="button"
            disabled={disabled}
            onClick={() => picker.current?.click()}
            className="hover:text-primary focus-visible:outline-primary font-mono text-xs lowercase underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 disabled:opacity-40"
          >
            upload image
          </button>
        </div>
      </div>
      <input
        ref={picker}
        id={`${id}-image`}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        aria-label={labelFor === `${id}-image` ? undefined : "upload image"}
        disabled={disabled}
        hidden
        onChange={(event) => {
          if (event.target.files && !disabled) void onFiles(event.target.files);
          event.target.value = "";
        }}
      />
      {children}
      {filename && (
        <p className="text-base-content/55 mt-3 text-xs break-words">
          {filename}
        </p>
      )}
      {dragging && !disabled && (
        <div className="bg-base-200/95 border-primary pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 border-2 border-dashed p-5 text-center">
          <p className="font-mono text-sm font-bold lowercase">
            Drop an image to read its text
          </p>
          <p className="text-base-content/65 text-xs">PNG, JPEG or WebP</p>
        </div>
      )}
    </div>
  );
}
