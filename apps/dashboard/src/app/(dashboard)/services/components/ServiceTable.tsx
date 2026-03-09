"use client";

import { useState, useMemo } from "react";
import type { ServiceMetadata, ServiceCategoryOption } from "../types";
import { findCategory } from "../types";

type SortField = "name" | "categoryId" | "durationMinutes" | "status" | "updatedAt";
type SortDir = "asc" | "desc";

interface ServiceTableProps {
  services: ServiceMetadata[];
  categories: ServiceCategoryOption[];
  onView: (service: ServiceMetadata) => void;
  onEdit: (service: ServiceMetadata) => void;
  onDuplicate: (service: ServiceMetadata) => void;
  onDelete: (id: string) => void;
}

const STATUS_CONFIG = {
  active: { label: "Active", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  draft: { label: "Draft", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  archived: { label: "Archived", cls: "bg-neutral-100 text-neutral-500 border-neutral-200" },
} as const;

export default function ServiceTable({
  services,
  categories,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
}: ServiceTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("updatedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // ── Filtering ──────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...services];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.internalCode.toLowerCase().includes(q) ||
          s.shortDescription.toLowerCase().includes(q)
      );
    }

    // Status
    if (statusFilter !== "all") {
      list = list.filter((s) => s.status === statusFilter);
    }

    // Category
    if (categoryFilter !== "all") {
      list = list.filter((s) => s.categoryId === categoryFilter);
    }

    // Sort
    list.sort((a, b) => {
      let cmp = 0;
      if (sortField === "name") cmp = a.name.localeCompare(b.name);
      else if (sortField === "categoryId") cmp = a.categoryId.localeCompare(b.categoryId);
      else if (sortField === "durationMinutes") cmp = a.durationMinutes - b.durationMinutes;
      else if (sortField === "status") cmp = a.status.localeCompare(b.status);
      else if (sortField === "updatedAt") cmp = a.updatedAt.localeCompare(b.updatedAt);
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [services, search, statusFilter, categoryFilter, sortField, sortDir]);

  // ── Sort toggle ────────────────────────────────────────────────
  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <span className="text-neutral-300 ml-1">↕</span>;
    return <span className="text-primary-500 ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>;
  }

  // ── Selection ──────────────────────────────────────────────────
  const allSelected = filtered.length > 0 && filtered.every((s) => selected.has(s.id));

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((s) => s.id)));
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // ── Counts ─────────────────────────────────────────────────────
  const activeCount = services.filter((s) => s.status === "active").length;
  const draftCount = services.filter((s) => s.status === "draft").length;

  // ── Format helpers ─────────────────────────────────────────────
  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
  }

  function formatPrice(svc: ServiceMetadata) {
    if (svc.pricePublic === null) return "—";
    if (svc.pricePublic === 0) return "Free";
    return `£${svc.pricePublic.toFixed(2)}`;
  }

  return (
    <div>
      {/* ── Toolbar ── */}
      <div className="flex flex-col gap-4 mb-5">
        {/* Stats Row */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-neutral-500">{services.length} services</span>
            <span className="text-neutral-300">·</span>
            <span className="text-emerald-600 font-medium">{activeCount} active</span>
            <span className="text-neutral-300">·</span>
            <span className="text-amber-600 font-medium">{draftCount} drafts</span>
          </div>
        </div>

        {/* Search + Filters Row */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search services..."
              className="w-full pl-9 pr-3.5 py-2.5 border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 border border-neutral-300 rounded-lg text-sm text-neutral-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3.5 py-2.5 border border-neutral-300 rounded-lg text-sm text-neutral-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          {/* Bulk Delete */}
          {selected.size > 0 && (
            <button
              type="button"
              onClick={() => {
                selected.forEach((id) => onDelete(id));
                setSelected(new Set());
              }}
              className="px-3.5 py-2.5 border border-red-300 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
            >
              Delete ({selected.size})
            </button>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <p className="text-sm text-neutral-500">No services match your filters.</p>
            <p className="text-xs text-neutral-400 mt-1">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/60">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500/20"
                  />
                </th>
                <th className="text-left px-4 py-3">
                  <button type="button" onClick={() => toggleSort("name")} className="text-xs font-semibold text-neutral-500 uppercase tracking-wider flex items-center hover:text-neutral-700">
                    Service <SortIcon field="name" />
                  </button>
                </th>
                <th className="text-left px-4 py-3">
                  <button type="button" onClick={() => toggleSort("categoryId")} className="text-xs font-semibold text-neutral-500 uppercase tracking-wider flex items-center hover:text-neutral-700">
                    Category <SortIcon field="categoryId" />
                  </button>
                </th>
                <th className="text-left px-4 py-3">
                  <button type="button" onClick={() => toggleSort("durationMinutes")} className="text-xs font-semibold text-neutral-500 uppercase tracking-wider flex items-center hover:text-neutral-700">
                    Duration <SortIcon field="durationMinutes" />
                  </button>
                </th>
                <th className="text-left px-4 py-3">
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Price</span>
                </th>
                <th className="text-left px-4 py-3">
                  <button type="button" onClick={() => toggleSort("status")} className="text-xs font-semibold text-neutral-500 uppercase tracking-wider flex items-center hover:text-neutral-700">
                    Status <SortIcon field="status" />
                  </button>
                </th>
                <th className="text-left px-4 py-3">
                  <button type="button" onClick={() => toggleSort("updatedAt")} className="text-xs font-semibold text-neutral-500 uppercase tracking-wider flex items-center hover:text-neutral-700">
                    Updated <SortIcon field="updatedAt" />
                  </button>
                </th>
                <th className="w-14 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((svc) => {
                const cat = findCategory(categories, svc.categoryId);
                const statusCfg = STATUS_CONFIG[svc.status];
                const isSelected = selected.has(svc.id);

                return (
                  <tr
                    key={svc.id}
                    className={`border-b border-neutral-100 last:border-0 transition-colors ${isSelected ? "bg-primary-50/30" : "hover:bg-neutral-50/60"}`}
                  >
                    <td className="px-4 py-3.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleOne(svc.id)}
                        className="w-4 h-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500/20"
                      />
                    </td>
                    <td className="px-4 py-3.5 max-w-xs">
                      <button type="button" onClick={() => onView(svc)} className="text-left group w-full">
                        <p className="text-sm font-medium text-neutral-900 group-hover:text-primary-600 transition-colors truncate">{svc.name}</p>
                        <p className="text-xs text-neutral-400 mt-0.5 truncate break-all">{svc.shortDescription}</p>
                      </button>
                    </td>
                    <td className="px-4 py-3.5">
                      {cat && (
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${cat.color}`}>
                          {cat.name}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm text-neutral-700">{svc.durationMinutes} min</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm text-neutral-700">{formatPrice(svc)}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusCfg.cls}`}>
                        {statusCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-neutral-500">{formatDate(svc.updatedAt)}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setOpenMenuId(openMenuId === svc.id ? null : svc.id)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
                          aria-label="Row actions"
                        >
                          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                          </svg>
                        </button>

                        {/* Dropdown Menu */}
                        {openMenuId === svc.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                            <div className="absolute right-0 top-full mt-1 z-20 w-40 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 animate-fadeIn">
                              <button
                                type="button"
                                onClick={() => { onView(svc); setOpenMenuId(null); }}
                                className="w-full text-left px-3.5 py-2 text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                              >
                                <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                View
                              </button>
                              <button
                                type="button"
                                onClick={() => { onEdit(svc); setOpenMenuId(null); }}
                                className="w-full text-left px-3.5 py-2 text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                              >
                                <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                                </svg>
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => { onDuplicate(svc); setOpenMenuId(null); }}
                                className="w-full text-left px-3.5 py-2 text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                              >
                                <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                                </svg>
                                Duplicate
                              </button>
                              <div className="border-t border-neutral-100 my-1" />
                              <button
                                type="button"
                                onClick={() => { onDelete(svc.id); setOpenMenuId(null); }}
                                className="w-full text-left px-3.5 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                </svg>
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        </div>
      </div>

      {/* ── Table Footer ── */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between mt-3 px-1">
          <p className="text-xs text-neutral-400">
            Showing {filtered.length} of {services.length} services
          </p>
        </div>
      )}
    </div>
  );
}
