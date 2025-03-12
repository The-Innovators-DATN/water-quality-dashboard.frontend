"use client";

import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { Map, List } from "lucide-react";

interface LayerSelectorProps {
    currentLayer: string;
    onLayerChange: (layer: string) => void;
}

const LayerSelector = ({ currentLayer, onLayerChange }: LayerSelectorProps) => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();

    // Lấy giá trị type từ URL
    const type = searchParams.get("type") || "map"; // Mặc định là "map" nếu không có type

    // Khi click vào nút, cập nhật URL
    const handleTypeChange = (newType: string) => {
        const params = new URLSearchParams(searchParams);
        params.set("type", newType);
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="h-[64px] bg-white p-2 shadow flex justify-between items-center">
            <div className="flex">
                <button
                    className={`px-3 py-1 flex gap-2 ${type === "map" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                    onClick={() => handleTypeChange("map")}
                >
                    <Map size={24} />
                    <p>Bản đồ</p>
                </button>
                <button
                    className={`px-3 py-1 flex gap-2 ${type === "list" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                    onClick={() => handleTypeChange("list")}
                >
                    <List size={24} />
                    <p>Danh sách</p>
                </button>
            </div>
            <div className="flex">
                {["", "catchments", "countries"].map((layer) => (
                    <button
                        key={layer}
                        className={`px-3 py-1 ${currentLayer === layer ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                        onClick={() => onLayerChange(layer)}
                    >
                        {layer === "" ? "Trạm" : layer === "catchments" ? "Lưu vực" : "Quốc gia"}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default LayerSelector;
