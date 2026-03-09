export type InventoryCategory = "vaccines" | "equipment" | "consumables" | "medications";
export type InventoryStatus = "in-stock" | "low-stock" | "out-of-stock";

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: InventoryCategory;
  quantity: number;
  unit: string;
  reorderLevel: number;
  status: InventoryStatus;
  notes: string;
  updatedAt: string;
}

export const INVENTORY_CATEGORIES: { value: InventoryCategory; label: string }[] = [
  { value: "vaccines", label: "Vaccines" },
  { value: "equipment", label: "Equipment" },
  { value: "consumables", label: "Consumables" },
  { value: "medications", label: "Medications" },
];

export function deriveStatus(quantity: number, reorderLevel: number): InventoryStatus {
  if (quantity <= 0) return "out-of-stock";
  if (quantity <= reorderLevel) return "low-stock";
  return "in-stock";
}
