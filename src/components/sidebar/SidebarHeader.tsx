"use client";

import { Droplet } from "lucide-react";

export default function SidebarHeader() {
  return (
    <div className="flex gap-2 justify-center items-center mb-4">
      <Droplet size={50} className="fill-blue-400 stroke-blue-400" />
      <h1 className="font-bold text-2xl">Aquatech</h1>
    </div>
  );
}