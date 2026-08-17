import React from 'react';
import { useLocation } from 'react-router-dom';

const Placeholder = () => {
  const location = useLocation();

  return (
    <div className='m-5 w-full flex items-center justify-center min-h-[80vh]'>
      <div className='text-center'>
        <h1 className='text-2xl font-medium text-gray-700 mb-2'>Coming Soon</h1>
        <p className='text-gray-500'>
          The screen for <span className='font-semibold'>{location.pathname}</span> is under development.
        </p>
      </div>
    </div>
  );
};

export default Placeholder;
