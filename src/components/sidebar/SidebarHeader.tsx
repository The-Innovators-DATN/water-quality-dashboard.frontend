"use client";

import { Droplet } from "lucide-react";

export default function SidebarHeader() {
  return (
    <div className="flex gap-2 justify-center items-center mb-4">
      <Droplet size={40} className="fill-blue-400 stroke-blue-400" />
      <h1 className="font-semibold text-2xl whitespace-nowrap">WATER PORTAL</h1>
    </div>
  );
}