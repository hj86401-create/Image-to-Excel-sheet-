import React from 'react';
import { TableData } from '../types';

interface TablePreviewProps {
  data: TableData;
}

const TablePreview: React.FC<TablePreviewProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center p-8 text-slate-500 bg-slate-50 rounded-lg border border-slate-200 border-dashed">
        No data found in image.
      </div>
    );
  }

  // Determine the max columns to ensure the table grid is consistent
  const maxCols = Math.max(...data.map(row => row.length));

  return (
    <div className="w-full border border-slate-200 rounded-lg overflow-hidden shadow-sm bg-white flex flex-col h-[500px]">
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
        <h3 className="font-medium text-slate-700 text-sm">Preview Data</h3>
        <span className="text-xs text-slate-500">{data.length} rows • {maxCols} columns</span>
      </div>
      
      <div className="overflow-auto flex-1 custom-scrollbar">
        <table className="w-full text-sm text-left text-slate-600 border-collapse">
          <thead className="text-xs text-slate-700 uppercase bg-slate-100 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 border-b border-r border-slate-200 w-12 text-center text-slate-400 font-normal">#</th>
              {Array.from({ length: maxCols }).map((_, i) => (
                <th key={i} className="px-4 py-3 border-b border-slate-200 whitespace-nowrap min-w-[100px]">
                  Col {String.fromCharCode(65 + i)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="bg-white border-b border-slate-100 hover:bg-indigo-50/30 transition-colors">
                 <td className="px-4 py-2 border-r border-slate-100 text-center text-xs text-slate-400 bg-slate-50/50">
                    {rowIndex + 1}
                 </td>
                {/* Ensure we render all cells even if the row array is shorter */}
                {Array.from({ length: maxCols }).map((_, colIndex) => (
                  <td key={colIndex} className="px-4 py-2 border-r border-slate-100 last:border-r-0 min-w-[100px]" title={row[colIndex] || ''}>
                    {row[colIndex] || ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TablePreview;