import { LucideIcon } from "lucide-react";

export interface NavItem {
  id: string;
  title: string;
  icon: LucideIcon | null;
  path: string;
  hasSubmenu?: boolean;
  submenu?: NavItem[];
  isSubmenuItem?: boolean;
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