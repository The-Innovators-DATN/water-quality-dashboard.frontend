const ParameterSidebar = ({ available, selected, toggle }: {
    available: string[];
    selected: string[];
    toggle: (param: string) => void;
}) => (
    <div className="w-60 border-r pr-4">
      <p className="font-semibold mb-2">Chọn thông số:</p>
      <div className="space-y-2">
        {available.map((param) => (
          <label key={param} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selected.includes(param)}
              onChange={() => toggle(param)}
            />
            {param}
          </label>
        ))}
      </div>
    </div>
);

export default ParameterSidebar;