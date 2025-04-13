import React from "react";

interface StatTableProps {
  selected: string[];
}

const StatTable: React.FC<StatTableProps> = ({ selected }) => {
  return (
    <table className="table-auto w-full text-sm border">
      <thead className="bg-gray-100">
        <tr>
          <th className="border px-2 py-1">Thông số</th>
          <th className="border px-2 py-1">Giá trị gần nhất</th>
        </tr>
      </thead>
      <tbody>
        {selected.map((param, idx) => (
          <tr key={idx}>
            <td className="border px-2 py-1">{param}</td>
            <td className="border px-2 py-1">{(Math.random() * 100).toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default StatTable;