export default function ParameterTable() {
    const data = [
      { group: "Thông số pH", name: "pH", short: "pH", unit: "---", value: "999999" },
      ...Array(5).fill({
        group: "Nhóm thông số thuốc bảo vệ thực vật",
        name: "Aldrin",
        short: "Aldrin",
        unit: "µg/l",
        value: "999999",
      }),
    ]
  
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border border-gray-300 text-sm text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-2 py-2 border">
                <input type="checkbox" />
              </th>
              <th className="px-2 py-2 border">Nhóm thông số</th>
              <th className="px-2 py-2 border">Thông số</th>
              <th className="px-2 py-2 border">Viết tắt</th>
              <th className="px-2 py-2 border">Đơn vị</th>
              <th className="px-2 py-2 border">Số lượng giá trị</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-2 py-2 border">
                  <input type="checkbox" />
                </td>
                <td className="px-2 py-2 border">{row.group}</td>
                <td className="px-2 py-2 border">{row.name}</td>
                <td className="px-2 py-2 border">{row.short}</td>
                <td className="px-2 py-2 border">{row.unit}</td>
                <td className="px-2 py-2 border">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
}