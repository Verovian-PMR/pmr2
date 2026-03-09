"use client";

import { useEffect, useRef } from "react";

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  /** Name of the item being deleted — shown in bold */
  itemName?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** "danger" = red accent (default), "warning" = amber accent */
  variant?: "danger" | "warning";
}

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = "Confirm Deletion",
  description,
  itemName,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  variant = "danger",
}: ConfirmModalProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  // Focus confirm button on open
  useEffect(() => {
    if (open) {
      setTimeout(() => confirmRef.current?.focus(), 50);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const isDanger = variant === "danger";
  const accentBg = isDanger ? "bg-red-50" : "bg-amber-50";
  const accentIcon = isDanger ? "text-red-500" : "text-amber-500";
  const confirmBg = isDanger
    ? "bg-red-600 hover:bg-red-700 focus:ring-red-500/30"
    : "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500/30";

  const iconPath = isDanger
    ? "M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
    : "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-neutral-900/50 backdrop-blur-[2px] animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal panel */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-scaleIn"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-desc"
      >
        {/* Icon + Content */}
        <div className="p-6 pb-4">
          <div className="flex items-start gap-4">
            <div className={`shrink-0 w-11 h-11 rounded-xl ${accentBg} flex items-center justify-center`}>
              <svg className={`w-5 h-5 ${accentIcon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h3 id="confirm-title" className="text-base font-semibold text-neutral-900">
                {title}
              </h3>
              <div id="confirm-desc" className="mt-1.5 text-sm text-neutral-500 leading-relaxed">
                {description ? (
                  <p>{description}</p>
                ) : (
                  <p>
                    Are you sure you want to delete{" "}
                    {itemName ? (
                      <span className="font-medium text-neutral-700">&quot;{itemName}&quot;</span>
                    ) : (
                      "this item"
                    )}
                    ? This action is irreversible and cannot be undone.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-neutral-200" />

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg border border-neutral-300 bg-white text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-500/20"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 ${confirmBg}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
