"use client";

import { useState } from "react";
import { FilterSelect } from "./FilterSelect";
import { FilterDatePicker } from "./FilterDatePicker";

const FilterSidebar = () => {
  const [filters, setFilters] = useState({
    parameterGroup: "",
    parameter: "",
    region: "",
    basin: "",
    country: "",
    stationType: "",
    startDate: new Date(),
    endDate: new Date(),
  });

  const handleFilterChange = (key: string, value: string | Date | null) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="w-56 bg-white shadow-lg p-3 space-y-3 text-sm truncate">
      <FilterSelect
        label="Nhóm tham số"
        value={filters.parameterGroup}
        onChange={(value) => handleFilterChange("parameterGroup", value)}
        options={[
          { value: "group1", label: "Nhóm 1" },
          { value: "group2", label: "Nhóm 2" },
        ]}
      />

      <FilterSelect
        label="Tham số"
        value={filters.parameter}
        onChange={(value) => handleFilterChange("parameter", value)}
        options={[
          { value: "param1", label: "Tham số 1" },
          { value: "param2", label: "Tham số 2" },
        ]}
      />

      <FilterSelect
        label="Khu vực"
        value={filters.region}
        onChange={(value) => handleFilterChange("region", value)}
        options={[
          { value: "north", label: "Miền Bắc" },
          { value: "south", label: "Miền Nam" },
        ]}
      />

      <FilterSelect
        label="Lưu vực"
        value={filters.basin}
        onChange={(value) => handleFilterChange("basin", value)}
        options={[
          { value: "basin1", label: "Lưu vực 1" },
          { value: "basin2", label: "Lưu vực 2" },
        ]}
      />

      <FilterSelect
        label="Quốc gia"
        value={filters.country}
        onChange={(value) => handleFilterChange("country", value)}
        options={[
          { value: "vn", label: "Việt Nam" },
          { value: "th", label: "Thái Lan" },
        ]}
      />

      <FilterSelect
        label="Loại trạm quan trắc"
        value={filters.stationType}
        onChange={(value) => handleFilterChange("stationType", value)}
        options={[
          { value: "auto", label: "Tự động" },
          { value: "manual", label: "Thủ công" },
        ]}
      />

      <FilterDatePicker
        label="Ngày bắt đầu"
        value={filters.startDate}
        onChange={(date) => handleFilterChange("startDate", date)}
      />

      <FilterDatePicker
        label="Ngày kết thúc"
        value={filters.endDate}
        onChange={(date) => handleFilterChange("endDate", date)}
      />
    </div>
  );
};

export default FilterSidebar;
