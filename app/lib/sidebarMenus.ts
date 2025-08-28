export type Role = "admin" | "educator" | "parent";

export const sidebarMenus: Record<Role, { name: string; path: string }[]> = {
  admin: [
    { name: "Home", path: "/dashboard" },
    { name: "Kids", path: "/dashboard/resident" },
    { name: "Fields", path: "/dashboard/programs" },
    { name: "Medical", path: "/dashboard/medical" },
    { name: "Assessment", path: "/dashboard/assessment" },
    { name: "Reporting", path: "/dashboard/reporting" },
  ],
  educator: [
    { name: "Kids", path: "/dashboard/resident" },
    { name: "Medical", path: "/dashboard/medical" },
    { name: "Assessment", path: "/dashboard/assessment" },
    { name: "Fields", path: "/dashboard/programs" },
  ],
  parent: [
    { name: "Kids", path: "/dashboard/resident" },
    { name: "Activity", path: "/dashboard/activity" },
    { name: "Medical", path: "/dashboard/medical" },


  ],
};
