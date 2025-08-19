export type Role = "admin" | "educator" | "parent";

export const sidebarMenus: Record<Role, { name: string; path: string }[]> = {
  admin: [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Resident", path: "/dashboard/resident" },
    { name: "Fields", path: "/dashboard/fields" },
    { name: "Medical", path: "/dashboard/medical" },
    { name: "Assessment", path: "/dashboard/assessment" },
    { name: "Reporting", path: "/dashboard/reporting" },
  ],
  educator: [
    { name: "Resident", path: "/dashboard/resident" },
    { name: "Medical", path: "/dashboard/medical" },
    { name: "Assessment", path: "/dashboard/assessment" },
    { name: "Fields", path: "/dashboard/fields" },
  ],
  parent: [
    { name: "Kids", path: "/dashboard/kids" },
  ],
};
