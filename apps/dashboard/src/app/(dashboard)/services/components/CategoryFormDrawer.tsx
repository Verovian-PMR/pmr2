"use client";

import { useState, useEffect } from "react";
import Drawer from "./Drawer";
import {
  type ServiceCategoryOption,
  CATEGORY_COLOR_OPTIONS,
  CATEGORY_ICON_OPTIONS,
} from "../types";

interface CategoryFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSave: (category: ServiceCategoryOption) => void;
  editCategory?: ServiceCategoryOption | null;
}

export default function CategoryFormDrawer({
  open,
  onClose,
  onSave,
  editCategory,
}: CategoryFormDrawerProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState(CATEGORY_ICON_OPTIONS[0].value);
  const [color, setColor] = useState(CATEGORY_COLOR_OPTIONS[0].value);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editCategory) {
      setName(editCategory.name);
      setDescription(editCategory.description);
      setIcon(editCategory.icon);
      setColor(editCategory.color);
    } else {
      setName("");
      setDescription("");
      setIcon(CATEGORY_ICON_OPTIONS[0].value);
      setColor(CATEGORY_COLOR_OPTIONS[0].value);
    }
    setErrors({});
  }, [editCategory, open]);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Category name is required.";
    if (!description.trim()) errs.description = "Description is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSave() {
    if (!validate()) return;

    const id = editCategory
      ? editCategory.id
      : name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    onSave({ id, name: name.trim(), description: description.trim(), icon, color });
  }

  const inputCls = "w-full px-3.5 py-2.5 border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors";
  const labelCls = "block text-sm font-medium text-neutral-700 mb-1.5";
  const errorCls = "text-xs text-red-600 mt-1";

  const footer = (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2.5 rounded-lg border border-neutral-300 bg-white text-neutral-700 text-sm font-medium hover:bg-neutral-50 transition-colors"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={handleSave}
        className="px-5 py-2.5 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors"
      >
        {editCategory ? "Update Category" : "Create Category"}
      </button>
    </div>
  );

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={editCategory ? "Edit Category" : "Add Category"}
      subtitle="Service categories organize your offerings for patients"
      width="max-w-lg"
      footer={footer}
      badge={
        editCategory ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            Editing
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-50 text-primary-700 border border-primary-200">
            New
          </span>
        )
      }
    >
      <div className="p-6 space-y-5">
        {/* Name */}
        <div>
          <label className={labelCls}>Category Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setErrors((p) => { const n = { ...p }; delete n.name; return n; }); }}
            placeholder="e.g., Wellness & Prevention"
            className={inputCls}
          />
          {errors.name && <p className={errorCls}>{errors.name}</p>}
        </div>

        {/* Description */}
        <div>
          <label className={labelCls}>Description <span className="text-red-500">*</span></label>
          <textarea
            value={description}
            onChange={(e) => { setDescription(e.target.value); setErrors((p) => { const n = { ...p }; delete n.description; return n; }); }}
            placeholder="Brief description shown to patients on the booking form"
            rows={2}
            className={inputCls + " resize-none"}
          />
          {errors.description && <p className={errorCls}>{errors.description}</p>}
        </div>

        {/* Icon Picker */}
        <div>
          <label className={labelCls}>Icon</label>
          <div className="grid grid-cols-5 gap-2">
            {CATEGORY_ICON_OPTIONS.map((opt) => (
              <button
                key={opt.label}
                type="button"
                onClick={() => setIcon(opt.value)}
                className={`
                  flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all
                  ${icon === opt.value
                    ? "border-primary-500 bg-primary-50"
                    : "border-neutral-200 hover:border-neutral-300 bg-white"
                  }
                `}
                title={opt.label}
              >
                <svg className={`w-6 h-6 ${icon === opt.value ? "text-primary-600" : "text-neutral-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={opt.value} />
                </svg>
                <span className={`text-[10px] font-medium ${icon === opt.value ? "text-primary-600" : "text-neutral-400"}`}>
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Color Picker */}
        <div>
          <label className={labelCls}>Pill Color</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_COLOR_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setColor(opt.value)}
                className={`
                  inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border-2 text-xs font-medium transition-all
                  ${color === opt.value
                    ? "border-primary-500 shadow-sm"
                    : "border-transparent hover:border-neutral-200"
                  }
                  ${opt.value}
                `}
              >
                {opt.label}
                {color === opt.value && (
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Live Preview */}
        <div>
          <label className={labelCls}>Preview</label>
          <div className="bg-neutral-50 rounded-xl p-5 border border-neutral-200">
            <div className="flex items-start gap-3.5">
              <div className={`shrink-0 w-11 h-11 rounded-lg flex items-center justify-center ${color.replace(/text-\S+/, "").trim()} ${color.match(/text-\S+/)?.[0] || ""}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-neutral-900">{name || "Category Name"}</p>
                <p className="text-xs text-neutral-500 mt-0.5">{description || "Category description will appear here"}</p>
              </div>
            </div>
            <div className="mt-3">
              <span className="text-[11px] font-medium">Pill: </span>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>
                {name || "Category"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
