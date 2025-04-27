'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import DetailPageTemplate from '@/components/water/DetailPageTemplate';
import { useDetailStore } from '@/lib/stores/useDetailStore';

type DetailType = 'station' | 'catchment' | 'country';

export default function DynamicDetailPage() {
  const { setDetail } = useDetailStore();
  const { type, id } = useParams() as { type: DetailType; id: string };
  const [data, setData] = useState<any>(null);
  const [label, setLabel] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        let endpoint = "";
        let labelText = "";

        switch (type) {
          case "station":
            endpoint = `/api/dashboard/stations/${id}`;
            labelText = "Trạm";
            break;
          case "catchment":
            endpoint = `/api/catchments/${id}`;
            labelText = "Lưu vực";
            break;
          case "country":
            endpoint = `/api/countries/${id}`;
            labelText = "Quốc gia";
            break;
          default:
            throw new Error("Loại không hợp lệ");
        }

        const res = await fetch(endpoint, {
          credentials: "include",
        });
        const result = await res.json();
        setData(result?.data || result);
        setLabel(labelText);

        setDetail({ type, id, name: result?.station.name || id });
      } catch (err) {
        console.error("Lỗi khi fetch:", err);
      }
    };

    fetchData();
  }, [type, id]);

  return data ? (
    <DetailPageTemplate label={label} data={data} />
  ) : (
    <div className="p-4">Đang tải...</div>
  );
}
