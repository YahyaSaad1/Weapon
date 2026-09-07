import React from 'react';

const StatusSelect = ({ value, onChange, options, includeAllOption = false, className = "" }) => {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    >
      {includeAllOption && <option value="الكل">جميع الحالات</option>}
      {options.map((status, index) => (
        <option key={index} value={status}>
          {status}
        </option>
      ))}
    </select>
  );
};

export default StatusSelect;