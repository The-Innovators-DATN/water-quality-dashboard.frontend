import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function AppLayout ( {children}: Readonly<{ children: React.ReactNode }> ) {
    return (
        <div className="h-screen w-screen flex">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
                <Header />
                {children}
            </div>
        </div>
    )
}