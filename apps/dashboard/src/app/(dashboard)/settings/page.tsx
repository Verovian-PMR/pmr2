"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import type { StaffRole, User, UserStatus } from "./types";
import { DEFAULT_STAFF_ROLES, DEFAULT_USERS } from "./types";
import ConfirmModal from "@/components/ConfirmModal";
import Drawer from "@/components/Drawer";
import { syncProvidersToApi } from "@/lib/syncProviders";

const USERS_KEY = "vivi_users";
const ROLES_KEY = "vivi_staff_roles";

type SettingsTab = "users" | "roles";

const STATUS_STYLES: Record<UserStatus, { bg: string; text: string; dot: string; label: string }> = {
  active:   { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", label: "Active" },
  inactive: { bg: "bg-neutral-100", text: "text-neutral-600", dot: "bg-neutral-400", label: "Inactive" },
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("users");

  // ── Staff Roles state ──────────────────────────────────────────
  const [roles, setRoles] = useState<StaffRole[]>(DEFAULT_STAFF_ROLES);
  const [roleEditingId, setRoleEditingId] = useState<string | null>(null);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [roleDesc, setRoleDesc] = useState("");
  const [roleError, setRoleError] = useState("");
  const [deleteRoleTarget, setDeleteRoleTarget] = useState<{ id: string; name: string } | null>(null);

  // ── Users state ────────────────────────────────────────────────
  const [users, setUsers] = useState<User[]>(DEFAULT_USERS);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage after hydration
  useEffect(() => {
    try {
      const storedRoles = localStorage.getItem(ROLES_KEY);
      if (storedRoles) setRoles(JSON.parse(storedRoles));
      const storedUsers = localStorage.getItem(USERS_KEY);
      if (storedUsers) setUsers(JSON.parse(storedUsers));
    } catch {}
    setHydrated(true);
  }, []);

  // Persist to localStorage + sync to API (skip the initial default write)
  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(USERS_KEY, JSON.stringify(users)); } catch {}
    syncProvidersToApi();
  }, [users, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(ROLES_KEY, JSON.stringify(roles)); } catch {}
    syncProvidersToApi();
  }, [roles, hydrated]);
  const [userDrawerOpen, setUserDrawerOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteUserTarget, setDeleteUserTarget] = useState<{ id: string; name: string } | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // User form fields
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formRoleId, setFormRoleId] = useState("");
  const [formStatus, setFormStatus] = useState<UserStatus>("active");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // ── Role helpers ───────────────────────────────────────────────
  const roleLookup = useMemo(() => {
    const map: Record<string, string> = {};
    roles.forEach((r) => { map[r.id] = r.name; });
    return map;
  }, [roles]);

  const openAddRole = useCallback(() => {
    setRoleEditingId(null);
    setRoleName("");
    setRoleDesc("");
    setRoleError("");
    setShowRoleForm(true);
  }, []);

  const openEditRole = useCallback((role: StaffRole) => {
    setRoleEditingId(role.id);
    setRoleName(role.name);
    setRoleDesc(role.description);
    setRoleError("");
    setShowRoleForm(true);
  }, []);

  const handleSaveRole = useCallback(() => {
    const name = roleName.trim();
    if (!name) { setRoleError("Role name is required."); return; }
    if (roleEditingId) {
      setRoles((prev) => prev.map((r) => r.id === roleEditingId ? { ...r, name, description: roleDesc.trim() } : r));
    } else {
      const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      if (roles.some((r) => r.id === id)) { setRoleError("A role with this name already exists."); return; }
      setRoles((prev) => [...prev, { id, name, description: roleDesc.trim() }]);
    }
    setShowRoleForm(false);
    setRoleEditingId(null);
  }, [roleEditingId, roleName, roleDesc, roles]);

  const confirmDeleteRole = useCallback(() => {
    if (!deleteRoleTarget) return;
    setRoles((prev) => prev.filter((r) => r.id !== deleteRoleTarget.id));
    setDeleteRoleTarget(null);
  }, [deleteRoleTarget]);

  // ── User helpers ───────────────────────────────────────────────
  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return users;
    const q = userSearch.toLowerCase();
    return users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [users, userSearch]);

  const resetUserForm = useCallback(() => {
    setFormName("");
    setFormEmail("");
    setFormPhone("");
    setFormRoleId(roles[0]?.id || "");
    setFormStatus("active");
    setFormErrors({});
  }, [roles]);

  const openAddUser = useCallback(() => {
    setEditingUser(null);
    resetUserForm();
    setUserDrawerOpen(true);
  }, [resetUserForm]);

  const openEditUser = useCallback((user: User) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPhone(user.phone);
    setFormRoleId(user.roleId);
    setFormStatus(user.status);
    setFormErrors({});
    setUserDrawerOpen(true);
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 2500);
  }, []);

  const handleSaveUser = useCallback(() => {
    const errs: Record<string, string> = {};
    if (!formName.trim()) errs.name = "Name is required.";
    if (!formEmail.trim()) errs.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formEmail)) errs.email = "Enter a valid email.";
    if (!formRoleId) errs.role = "Role is required.";
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }

    if (editingUser) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? { ...u, name: formName.trim(), email: formEmail.trim(), phone: formPhone.trim(), roleId: formRoleId, status: formStatus }
            : u
        )
      );
      showToast("User updated successfully");
    } else {
      const id = `usr-${Date.now()}`;
      setUsers((prev) => [
        ...prev,
        { id, name: formName.trim(), email: formEmail.trim(), phone: formPhone.trim(), roleId: formRoleId, status: formStatus, avatarUrl: "" },
      ]);
      showToast("User added successfully");
    }

    setUserDrawerOpen(false);
    setEditingUser(null);
  }, [editingUser, formName, formEmail, formPhone, formRoleId, formStatus, showToast]);

  const confirmDeleteUser = useCallback(() => {
    if (!deleteUserTarget) return;
    setUsers((prev) => prev.filter((u) => u.id !== deleteUserTarget.id));
    setDeleteUserTarget(null);
    showToast("User deleted");
  }, [deleteUserTarget, showToast]);

  // ── Shared styles ──────────────────────────────────────────────
  const inputCls =
    "w-full px-3.5 py-2.5 border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors";
  const labelCls = "block text-xs font-medium text-neutral-600 mb-1.5";

  const tabs: { id: SettingsTab; label: string; icon: string }[] = [
    { id: "users", label: "Users", icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" },
    { id: "roles", label: "Staff Roles", icon: "M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-neutral-900">Settings</h2>
          <p className="text-sm text-neutral-500 mt-0.5">Manage users, staff roles, and system configuration.</p>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 bg-neutral-100 rounded-xl p-1 mb-6 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-white text-primary-700 shadow-sm"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
            </svg>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ════════════════ USERS TAB ════════════════ */}
      {activeTab === "users" && (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
            <div className="relative flex-1 max-w-xs">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                placeholder="Search users..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-neutral-300 rounded-lg text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>
            <button
              type="button"
              onClick={openAddUser}
              className="flex items-center gap-2 bg-primary-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add User
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/50">
                  <th className="text-left font-medium text-neutral-500 px-6 py-3">Name</th>
                  <th className="text-left font-medium text-neutral-500 px-6 py-3">Email</th>
                  <th className="text-left font-medium text-neutral-500 px-6 py-3">Role</th>
                  <th className="text-left font-medium text-neutral-500 px-6 py-3">Status</th>
                  <th className="text-right font-medium text-neutral-500 px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredUsers.map((user) => {
                  const st = STATUS_STYLES[user.status];
                  return (
                    <tr key={user.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold shrink-0">
                            {user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-neutral-800">{user.name}</p>
                            <p className="text-xs text-neutral-400">{user.phone || "\u2014"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-neutral-600">{user.email}</td>
                      <td className="px-6 py-3.5">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700 border border-primary-200">
                          {roleLookup[user.roleId] || user.roleId}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${st.bg} ${st.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                          {st.label}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEditUser(user)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteUserTarget({ id: user.id, name: user.name })}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-neutral-500">
                      {userSearch ? "No users match your search." : "No users yet. Click \"Add User\" to create one."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Count footer */}
          <div className="px-6 py-3 border-t border-neutral-200 flex items-center justify-between">
            <span className="text-xs text-neutral-400">
              {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""}
              {userSearch && ` matching \u201c${userSearch}\u201d`}
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
              {users.filter((u) => u.status === "active").length} active
            </span>
          </div>
        </div>
      )}

      {/* ════════════════ STAFF ROLES TAB ════════════════ */}
      {activeTab === "roles" && (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
            <div>
              <h3 className="text-base font-semibold text-neutral-900">Staff Roles</h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Define roles that can be assigned to users and services.
              </p>
            </div>
            <button
              type="button"
              onClick={openAddRole}
              className="flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Role
            </button>
          </div>

          {/* Inline form */}
          {showRoleForm && (
            <div className="px-6 py-4 bg-primary-50/30 border-b border-neutral-200 animate-fadeIn">
              <div className="flex items-start gap-4">
                <div className="flex-1 space-y-3">
                  <div>
                    <label className={labelCls}>
                      Role Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={roleName}
                      onChange={(e) => { setRoleName(e.target.value); setRoleError(""); }}
                      placeholder="e.g., Senior Pharmacist"
                      className={inputCls}
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Description</label>
                    <input
                      type="text"
                      value={roleDesc}
                      onChange={(e) => setRoleDesc(e.target.value)}
                      placeholder="Brief description of responsibilities"
                      className={inputCls}
                    />
                  </div>
                  {roleError && <p className="text-xs text-red-600">{roleError}</p>}
                </div>
                <div className="flex gap-2 pt-5">
                  <button type="button" onClick={() => setShowRoleForm(false)} className="px-3.5 py-2 rounded-lg border border-neutral-300 bg-white text-neutral-600 text-sm font-medium hover:bg-neutral-50 transition-colors">
                    Cancel
                  </button>
                  <button type="button" onClick={handleSaveRole} className="px-4 py-2 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors">
                    {roleEditingId ? "Update" : "Add"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Roles list */}
          <div className="divide-y divide-neutral-100">
            {roles.map((role) => {
              const userCount = users.filter((u) => u.roleId === role.id).length;
              return (
                <div key={role.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-neutral-50/50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-neutral-800">{role.name}</p>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-100 text-neutral-500 font-medium">
                            {userCount} user{userCount !== 1 ? "s" : ""}
                          </span>
                        </div>
                        {role.description && <p className="text-xs text-neutral-500 mt-0.5">{role.description}</p>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-4">
                    <button type="button" onClick={() => openEditRole(role)} className="p-1.5 rounded-lg text-neutral-400 hover:text-primary-600 hover:bg-primary-50 transition-colors" title="Edit">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                      </svg>
                    </button>
                    <button type="button" onClick={() => setDeleteRoleTarget({ id: role.id, name: role.name })} className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
            {roles.length === 0 && (
              <div className="px-6 py-12 text-center">
                <p className="text-sm text-neutral-500">No roles defined. Click &quot;Add Role&quot; to create one.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════ USER FORM DRAWER ════════════════ */}
      <Drawer
        open={userDrawerOpen}
        onClose={() => { setUserDrawerOpen(false); setEditingUser(null); }}
        title={editingUser ? "Edit User" : "Add New User"}
        subtitle={editingUser ? editingUser.email : "Create a new staff account"}
        width="max-w-lg"
        footer={
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => { setUserDrawerOpen(false); setEditingUser(null); }}
              className="px-4 py-2.5 rounded-lg border border-neutral-300 bg-white text-neutral-700 text-sm font-medium hover:bg-neutral-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveUser}
              className="px-5 py-2.5 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors shadow-sm"
            >
              {editingUser ? "Save Changes" : "Add User"}
            </button>
          </div>
        }
      >
        <div className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className={labelCls}>Full Name <span className="text-red-500">*</span></label>
            <input type="text" value={formName} onChange={(e) => { setFormName(e.target.value); setFormErrors((p) => { const n = { ...p }; delete n.name; return n; }); }} placeholder="e.g., Dr. Jane Smith" className={inputCls} autoFocus />
            {formErrors.name && <p className="text-xs text-red-600 mt-1">{formErrors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className={labelCls}>Email Address <span className="text-red-500">*</span></label>
            <input type="email" value={formEmail} onChange={(e) => { setFormEmail(e.target.value); setFormErrors((p) => { const n = { ...p }; delete n.email; return n; }); }} placeholder="jane.smith@vivipractice.co.uk" className={inputCls} />
            {formErrors.email && <p className="text-xs text-red-600 mt-1">{formErrors.email}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className={labelCls}>Phone Number</label>
            <input type="tel" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} placeholder="07700 000000" className={inputCls} />
          </div>

          {/* Role */}
          <div>
            <label className={labelCls}>Role <span className="text-red-500">*</span></label>
            <select
              value={formRoleId}
              onChange={(e) => { setFormRoleId(e.target.value); setFormErrors((p) => { const n = { ...p }; delete n.role; return n; }); }}
              className={inputCls}
            >
              <option value="">Select a role...</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
            {formErrors.role && <p className="text-xs text-red-600 mt-1">{formErrors.role}</p>}
            {roles.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">No roles defined. Add roles in the Staff Roles tab first.</p>
            )}
          </div>

          {/* Status toggle */}
          <div>
            <label className={labelCls}>Account Status</label>
            <div className="flex items-center gap-3 mt-1">
              <button
                type="button"
                onClick={() => setFormStatus(formStatus === "active" ? "inactive" : "active")}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formStatus === "active" ? "bg-emerald-500" : "bg-neutral-300"
                }`}
              >
                <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform shadow-sm ${
                  formStatus === "active" ? "translate-x-6" : "translate-x-1"
                }`} />
              </button>
              <span className={`text-sm font-medium ${formStatus === "active" ? "text-emerald-700" : "text-neutral-500"}`}>
                {formStatus === "active" ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>
      </Drawer>

      {/* Delete Modals */}
      <ConfirmModal
        open={!!deleteRoleTarget}
        onClose={() => setDeleteRoleTarget(null)}
        onConfirm={confirmDeleteRole}
        title="Delete Staff Role"
        itemName={deleteRoleTarget?.name}
      />
      <ConfirmModal
        open={!!deleteUserTarget}
        onClose={() => setDeleteUserTarget(null)}
        onConfirm={confirmDeleteUser}
        title="Delete User"
        itemName={deleteUserTarget?.name}
      />

      {/* Save toast */}
      {showSaveToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg animate-[fadeIn_0.2s_ease-out]">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
