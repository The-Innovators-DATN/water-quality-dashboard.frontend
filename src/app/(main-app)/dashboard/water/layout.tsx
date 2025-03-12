import FilterSidebar from "@/components/filters/FilterSidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="w-full h-full flex">
        {children}
        <FilterSidebar />
    </div>
  );
}