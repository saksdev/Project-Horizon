import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Settings,
} from "lucide-react";

export type SidebarItem = {
  id: number;
  title: string;
  path: string;
  icon: React.ElementType;
};

export const sidebarItems: SidebarItem[] = [
  {
    id: 1,
    title: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    id: 2,
    title: "Projects",
    path: "/projects",
    icon: FolderKanban,
  },
  {
    id: 3,
    title: "Users",
    path: "/users",
    icon: Users,
  },
  {
    id: 4,
    title: "Settings",
    path: "/settings",
    icon: Settings,
  },
];