"use client";

interface FilterSelectProps {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}

const FilterSelect = ({ label, options, value, onChange }: FilterSelectProps) => {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      {/* <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={`Chọn ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select> */}
    </div>
  );
};

export default FilterSelect;
