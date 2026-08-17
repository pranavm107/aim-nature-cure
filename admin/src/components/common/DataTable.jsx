import React from 'react';

const DataTable = ({ 
  columns, 
  data, 
  loading = false, 
  emptyMessage = "No data available",
  keyField = "_id",
  renderRow,
  gridColsClass = "grid-cols-[1fr]" 
}) => {

  if (loading) {
    return (
      <div className='bg-white border rounded text-sm w-full p-8 text-center text-gray-500'>
        Loading...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className='bg-white border rounded text-sm w-full p-8 text-center text-gray-500'>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className='bg-white border rounded text-sm max-h-[80vh] overflow-y-scroll'>
      <div className={`hidden sm:grid ${gridColsClass} grid-flow-col py-3 px-6 border-b bg-gray-50 font-medium text-gray-600`}>
        {columns.map((col, i) => (
          <p key={i} className={col.className || ''}>{col.label}</p>
        ))}
      </div>
      {data.map((item, index) => renderRow(item, index))}
    </div>
  );
};

export default DataTable;
