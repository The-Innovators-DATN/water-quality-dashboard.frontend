import { Droplet, ChartNoAxesColumnIncreasing, Server, TriangleAlert, ClipboardList, User } from "lucide-react";

const navItems = [
    {
        id: "dashboard",
        title: "Dashboard",
        icon: ChartNoAxesColumnIncreasing 
    }, 
    {
        id: "data",
        title: "Dữ liệu",
        icon: Server 
    },
    {
        id: "alert",
        title: "Cảnh báo",
        icon: TriangleAlert 
    },
    {
        id: "report",
        title: "Báo cáo",
        icon: ClipboardList 
    },
    {
        id: "account",
        title: "Tài khoản",
        icon: User 
    },
]

export default function Sidebar () {
    return (
        <div className="w-auto h-full p-4 space-y-2 bg-gray-800 text-white">
            <div className="flex gap-2 justify-center items-center">
                <Droplet size={40} className="fill-blue-400 stroke-blue-400" />
                <h1 className="font-semibold text-2xl whitespace-nowrap">WATER PORTAL</h1>
            </div>
            <div className="space-y-4 p-2">
                {navItems.map((item) => {
                    return (
                        <div key={item.id} className="gap-2 flex items-center">
                            <item.icon size={24} />
                            <p className="text-md">{item.title}</p>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}