import React from 'react';

const NotificationsPanel = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-40 bg-transparent"
        onClick={onClose}
      ></div>
      <div className="absolute top-14 right-4 sm:right-10 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
        </div>
        <div className="p-8 text-center text-gray-500">
          <p>No new notifications</p>
        </div>
        <div className="p-3 border-t bg-gray-50 text-center rounded-b-lg">
          <button className="text-sm text-primary hover:underline font-medium">Mark all as read</button>
        </div>
      </div>
    </>
  );
};

export default NotificationsPanel;
