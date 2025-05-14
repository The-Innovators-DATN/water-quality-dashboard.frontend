'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import DetailPageTemplate from '@/components/water/DetailPageTemplate';
import { useDetailStore } from '@/lib/stores/useDetailStore';

type DetailType = 'station' | 'catchment' | 'country';

const OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

export default function DynamicDetailPage() {
  const { setDetail } = useDetailStore();
  const { type, id } = useParams() as { type: DetailType; id: string };
  const [data, setData] = useState<any>(null);
  const [label, setLabel] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (type !== 'station') throw new Error("Chỉ hỗ trợ kiểu 'station'");

        const stationRes = await fetch(`/api/dashboard/stations/${id}`, {
          credentials: 'include',
        });
        const stationData = await stationRes.json();

        const station = stationData?.data?.station || stationData?.station;
        const location = stationData?.data?.location || stationData?.location;

        if (!station?.lat || !station?.long) throw new Error("Thiếu tọa độ trạm");

        const weatherRes = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${station.lat}&lon=${station.long}&appid=${OPENWEATHER_API_KEY}&units=metric`
        );
        const weather = await weatherRes.json();

        setData({
          station,
          location,
          weather,
        });
        setLabel("Trạm");

        setDetail({ type, id, name: station.name || id });
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
