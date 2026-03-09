import type { InventoryItem } from "./types";

export const DEMO_INVENTORY: InventoryItem[] = [
  { id: "inv-001", sku: "INV-FLU-VIAL", name: "Influenza Vaccine Vial (10-dose)", category: "vaccines", quantity: 45, unit: "vials", reorderLevel: 20, status: "in-stock", notes: "2025/26 season stock", updatedAt: "2026-02-28T10:00:00Z" },
  { id: "inv-002", sku: "INV-COVID-MRNA", name: "COVID-19 mRNA Booster Vial", category: "vaccines", quantity: 12, unit: "vials", reorderLevel: 15, status: "low-stock", notes: "Stored at -20°C. Check expiry monthly.", updatedAt: "2026-02-25T14:00:00Z" },
  { id: "inv-003", sku: "INV-SHINGRIX", name: "Shingrix Vaccine (Single Dose)", category: "vaccines", quantity: 30, unit: "doses", reorderLevel: 10, status: "in-stock", notes: "Two-dose series; track patient 2nd dose.", updatedAt: "2026-02-20T09:00:00Z" },
  { id: "inv-004", sku: "INV-BP-CUFF", name: "Omron HEM-907XL BP Cuff", category: "equipment", quantity: 4, unit: "units", reorderLevel: 2, status: "in-stock", notes: "Calibrate monthly. Last calibration: Feb 2026.", updatedAt: "2026-02-15T11:00:00Z" },
  { id: "inv-005", sku: "INV-GLUC-STRIP", name: "Blood Glucose Test Strips (50ct)", category: "consumables", quantity: 8, unit: "boxes", reorderLevel: 10, status: "low-stock", notes: "OneTouch Ultra brand. Expires Dec 2026.", updatedAt: "2026-02-28T08:00:00Z" },
  { id: "inv-006", sku: "INV-LANCETS", name: "Sterile Lancets (200ct)", category: "consumables", quantity: 25, unit: "boxes", reorderLevel: 5, status: "in-stock", notes: "28-gauge, single-use.", updatedAt: "2026-02-22T10:00:00Z" },
  { id: "inv-007", sku: "INV-CHOL-KIT", name: "Cholesterol Panel Test Kit", category: "consumables", quantity: 0, unit: "kits", reorderLevel: 5, status: "out-of-stock", notes: "CardioChek PA analyser cartridges. Reorder pending.", updatedAt: "2026-03-01T09:00:00Z" },
  { id: "inv-008", sku: "INV-NRT-PATCH", name: "Nicotine Patches (21mg, 14-day)", category: "medications", quantity: 18, unit: "boxes", reorderLevel: 8, status: "in-stock", notes: "For smoking cessation program.", updatedAt: "2026-02-18T16:00:00Z" },
  { id: "inv-009", sku: "INV-BLISTER-PK", name: "Blister Packaging Trays (7-day)", category: "consumables", quantity: 50, unit: "trays", reorderLevel: 20, status: "in-stock", notes: "AM/PM split trays.", updatedAt: "2026-02-10T12:00:00Z" },
  { id: "inv-010", sku: "INV-STREP-RAPID", name: "Rapid Strep Test Kit (25ct)", category: "consumables", quantity: 3, unit: "boxes", reorderLevel: 5, status: "low-stock", notes: "QuickVue Inline brand. Results in 5 mins.", updatedAt: "2026-02-27T14:00:00Z" },
];
