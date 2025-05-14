"use client";

import DashboardEditor from "@/components/dashboard/DashboardEditor";
import { useParams } from "next/navigation";

export default function EditDashboardPage() {
  const { uid } = useParams();
  return <DashboardEditor isEditMode={true} dashboardUid={uid as string} />;
}