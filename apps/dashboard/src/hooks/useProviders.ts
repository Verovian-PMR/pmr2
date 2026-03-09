"use client";

import { useState, useEffect, useMemo } from "react";
import type { User, StaffRole } from "@/app/(dashboard)/settings/types";
import { DEFAULT_USERS, DEFAULT_STAFF_ROLES } from "@/app/(dashboard)/settings/types";
import type { Provider } from "@/app/(dashboard)/schedule/types";

const USERS_KEY = "vivi_users";
const ROLES_KEY = "vivi_staff_roles";
const COLOR_PALETTE = ["blue", "violet", "emerald", "amber", "rose"];

function initials(name: string): string {
  return name
    .split(" ")
    .filter((w) => w.length > 0)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/**
 * Derives a Provider[] from the active users stored in Settings.
 * Reads users + roles from localStorage (same keys the Settings page persists to).
 * Falls back to DEFAULT_USERS / DEFAULT_STAFF_ROLES when nothing is stored.
 */
export function useProviders(): Provider[] {
  const [users, setUsers] = useState<User[]>(DEFAULT_USERS);
  const [roles, setRoles] = useState<StaffRole[]>(DEFAULT_STAFF_ROLES);

  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem(USERS_KEY);
      if (storedUsers) setUsers(JSON.parse(storedUsers));
      const storedRoles = localStorage.getItem(ROLES_KEY);
      if (storedRoles) setRoles(JSON.parse(storedRoles));
    } catch {}
  }, []);

  return useMemo(() => {
    const roleMap: Record<string, string> = {};
    roles.forEach((r) => {
      roleMap[r.id] = r.name;
    });

    return users
      .filter((u) => u.status === "active")
      .map((u, i) => ({
        id: u.id,
        name: u.name,
        title: roleMap[u.roleId] || u.roleId,
        color: COLOR_PALETTE[i % COLOR_PALETTE.length],
        initials: initials(u.name),
      }));
  }, [users, roles]);
}
