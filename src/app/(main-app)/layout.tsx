import Sidebar from "@/components/sidebar/Sidebar";

export default function AppLayout ( {children}: Readonly<{ children: React.ReactNode }> ) {
    return (
        <div className="h-screen w-screen flex">
            <Sidebar />
            {children}
        </div>
    )
}