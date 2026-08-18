import React from 'react';

const DataTable = ({ 
  columns, 
  data, 
  loading = false, 
  emptyMessage = "No data available",
  keyField = "_id",
  renderRow,
  renderMobileCard,
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
    <div className='bg-white sm:border sm:rounded text-sm'>
      {/* Desktop & Tablet Table View */}
      <div className='hidden sm:block max-h-[80vh] overflow-y-auto custom-scrollbar'>
        <div className={`grid ${gridColsClass} grid-flow-col py-3 px-6 border-b bg-gray-50 font-medium text-gray-600 sticky top-0 z-10`}>
          {columns.map((col, i) => (
            <p key={i} className={col.className || ''}>{col.label}</p>
          ))}
        </div>
        <div className="bg-white">
          {data.map((item, index) => renderRow(item, index))}
        </div>
      </div>

      {/* Mobile Card View */}
      <div className='sm:hidden flex flex-col gap-4 p-4 bg-gray-50/50 min-h-[50vh]'>
        {data.map((item, index) => renderMobileCard ? renderMobileCard(item, index) : (
          <div key={item[keyField] || index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 relative overflow-hidden">
             {renderRow(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataTable;
