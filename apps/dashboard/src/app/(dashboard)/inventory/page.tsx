"use client";

import { useState, useCallback, useMemo } from "react";
import type { InventoryItem, InventoryCategory } from "./types";
import { INVENTORY_CATEGORIES, deriveStatus } from "./types";
import { DEMO_INVENTORY } from "./data";
import ConfirmModal from "@/components/ConfirmModal";

const STATUS_STYLES: Record<string, string> = {
  "in-stock": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "low-stock": "bg-amber-50 text-amber-700 border-amber-200",
  "out-of-stock": "bg-red-50 text-red-700 border-red-200",
};

const STATUS_LABELS: Record<string, string> = {
  "in-stock": "In Stock",
  "low-stock": "Low Stock",
  "out-of-stock": "Out of Stock",
};

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>(DEMO_INVENTORY);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form fields
  const [fSku, setFSku] = useState("");
  const [fName, setFName] = useState("");
  const [fCategory, setFCategory] = useState<InventoryCategory>("consumables");
  const [fQuantity, setFQuantity] = useState(0);
  const [fUnit, setFUnit] = useState("");
  const [fReorder, setFReorder] = useState(0);
  const [fNotes, setFNotes] = useState("");
  const [fError, setFError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const filtered = useMemo(() => {
    let list = items;
    if (filterCat !== "all") list = list.filter((i) => i.category === filterCat);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.sku.toLowerCase().includes(q)
      );
    }
    return list;
  }, [items, search, filterCat]);

  const resetForm = useCallback(() => {
    setFSku("");
    setFName("");
    setFCategory("consumables");
    setFQuantity(0);
    setFUnit("units");
    setFReorder(0);
    setFNotes("");
    setFError("");
  }, []);

  const openAdd = useCallback(() => {
    setEditingId(null);
    resetForm();
    setShowForm(true);
  }, [resetForm]);

  const openEdit = useCallback((item: InventoryItem) => {
    setEditingId(item.id);
    setFSku(item.sku);
    setFName(item.name);
    setFCategory(item.category);
    setFQuantity(item.quantity);
    setFUnit(item.unit);
    setFReorder(item.reorderLevel);
    setFNotes(item.notes);
    setFError("");
    setShowForm(true);
  }, []);

  const handleSave = useCallback(() => {
    if (!fName.trim()) { setFError("Item name is required."); return; }
    if (!fSku.trim()) { setFError("SKU is required."); return; }

    const now = new Date().toISOString();
    const status = deriveStatus(fQuantity, fReorder);

    if (editingId) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === editingId
            ? { ...i, sku: fSku.trim(), name: fName.trim(), category: fCategory, quantity: fQuantity, unit: fUnit.trim() || "units", reorderLevel: fReorder, status, notes: fNotes.trim(), updatedAt: now }
            : i
        )
      );
    } else {
      const newItem: InventoryItem = {
        id: `inv-${Date.now()}`,
        sku: fSku.trim(),
        name: fName.trim(),
        category: fCategory,
        quantity: fQuantity,
        unit: fUnit.trim() || "units",
        reorderLevel: fReorder,
        status,
        notes: fNotes.trim(),
        updatedAt: now,
      };
      setItems((prev) => [newItem, ...prev]);
    }

    setShowForm(false);
    setEditingId(null);
  }, [editingId, fSku, fName, fCategory, fQuantity, fUnit, fReorder, fNotes]);

  const requestDelete = useCallback(
    (id: string) => {
      const item = items.find((i) => i.id === id);
      setDeleteTarget({ id, name: item?.name || "this item" });
    },
    [items]
  );

  const confirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
    setDeleteTarget(null);
  }, [deleteTarget]);

  const inputCls = "w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors";

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-neutral-900">Inventory</h2>
          <p className="text-sm text-neutral-500 mt-0.5">Manage stock items, track quantities, and link to services.</p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="flex items-center gap-2 bg-primary-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Item
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm">
        <div className="flex items-center gap-3 px-5 py-3 border-b border-neutral-200">
          <div className="relative flex-1 max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-neutral-300 rounded-lg text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>
          <select
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            className="px-3 py-2 border border-neutral-300 rounded-lg text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          >
            <option value="all">All Categories</option>
            {INVENTORY_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <span className="text-xs text-neutral-400 ml-auto">{filtered.length} item{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Inline form */}
        {showForm && (
          <div className="px-5 py-4 bg-primary-50/30 border-b border-neutral-200 animate-fadeIn">
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">SKU <span className="text-red-500">*</span></label>
                <input type="text" value={fSku} onChange={(e) => { setFSku(e.target.value); setFError(""); }} placeholder="INV-XXX" className={inputCls} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-neutral-600 mb-1">Item Name <span className="text-red-500">*</span></label>
                <input type="text" value={fName} onChange={(e) => { setFName(e.target.value); setFError(""); }} placeholder="e.g., Flu Vaccine Vial" className={inputCls} autoFocus />
              </div>
            </div>
            <div className="grid grid-cols-5 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Category</label>
                <select value={fCategory} onChange={(e) => setFCategory(e.target.value as InventoryCategory)} className={inputCls}>
                  {INVENTORY_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Quantity</label>
                <input type="number" min={0} value={fQuantity} onChange={(e) => setFQuantity(parseInt(e.target.value) || 0)} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Unit</label>
                <input type="text" value={fUnit} onChange={(e) => setFUnit(e.target.value)} placeholder="vials" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Reorder Level</label>
                <input type="number" min={0} value={fReorder} onChange={(e) => setFReorder(parseInt(e.target.value) || 0)} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Notes</label>
                <input type="text" value={fNotes} onChange={(e) => setFNotes(e.target.value)} placeholder="Optional" className={inputCls} />
              </div>
            </div>
            {fError && <p className="text-xs text-red-600 mb-2">{fError}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-3.5 py-2 rounded-lg border border-neutral-300 bg-white text-neutral-600 text-sm font-medium hover:bg-neutral-50 transition-colors">Cancel</button>
              <button type="button" onClick={handleSave} className="px-4 py-2 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors">{editingId ? "Update" : "Add Item"}</button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/50">
                <th className="text-left font-medium text-neutral-500 px-5 py-3">SKU</th>
                <th className="text-left font-medium text-neutral-500 px-5 py-3">Item Name</th>
                <th className="text-left font-medium text-neutral-500 px-5 py-3">Category</th>
                <th className="text-right font-medium text-neutral-500 px-5 py-3">Qty</th>
                <th className="text-left font-medium text-neutral-500 px-5 py-3">Status</th>
                <th className="text-right font-medium text-neutral-500 px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-neutral-500">{item.sku}</td>
                  <td className="px-5 py-3">
                    <p className="font-medium text-neutral-800">{item.name}</p>
                    {item.notes && <p className="text-xs text-neutral-400 mt-0.5 truncate max-w-xs">{item.notes}</p>}
                  </td>
                  <td className="px-5 py-3 capitalize text-neutral-600">{item.category}</td>
                  <td className="px-5 py-3 text-right">
                    <span className="font-medium text-neutral-800">{item.quantity}</span>
                    <span className="text-neutral-400 ml-1">{item.unit}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[item.status]}`}>
                      {STATUS_LABELS[item.status]}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button type="button" onClick={() => openEdit(item)} className="p-1.5 rounded-lg text-neutral-400 hover:text-primary-600 hover:bg-primary-50 transition-colors" title="Edit">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                        </svg>
                      </button>
                      <button type="button" onClick={() => requestDelete(item.id)} className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-neutral-500">
                    No inventory items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Inventory Item"
        itemName={deleteTarget?.name}
      />
    </div>
  );
}
