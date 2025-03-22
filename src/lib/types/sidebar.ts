import { LucideIcon } from "lucide-react";

export interface NavItem {
  id: string;
  title: string;
  icon: LucideIcon;
  path: string;
  hasSubmenu?: boolean;
  submenu?: {
    id: string;
    title: string;
    path: string;
    icon: LucideIcon | null;
  }[];
}

export interface ProfileMenuItem {
  id: string;
  title: string;
  icon: LucideIcon;
  path: string;
  shortcut?: string;
}

export interface ProfileMenuSection {
  title?: string;
  items: ProfileMenuItem[];
  hasDivider?: boolean;
}