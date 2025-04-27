import { useEffect, useState } from "react";

export interface Parameter {
  id: number;
  name: string;
  parameterGroup?: string;
}

export const useStationParameters = (stationId: number) => {
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [grouped, setGrouped] = useState<Record<string, Parameter[]>>({});

  useEffect(() => {
    const fetchParameters = async () => {
      const res = await fetch("/api/dashboard/station_parameters/by_target", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ target_type: "STATION", target_id: stationId }),
      });

      const result = await res.json();
      const params = result?.data.parameters || [];

      setParameters(params);

      const grouped = params.reduce(
        (acc: Record<string, Parameter[]>, param: Parameter) => {
          const group = param.parameterGroup || "Khác";
          acc[group] = acc[group] || [];
          acc[group].push(param);
          return acc;
        },
        {}
      );

      setGrouped(grouped);
    };

    if (stationId) fetchParameters();
  }, [stationId]);

  return { parameters, grouped };
};