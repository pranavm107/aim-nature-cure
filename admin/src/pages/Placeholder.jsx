import React from 'react';
import { useLocation } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import PageHeader from '../components/layout/PageHeader';

const Placeholder = () => {
  const location = useLocation();

  return (
    <PageContainer>
      <PageHeader title="Coming Soon" subtitle="This feature is under development" />
      <div className='w-full flex items-center justify-center min-h-[60vh] bg-white rounded-xl border border-gray-100 shadow-sm'>
        <div className='text-center p-8'>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 mx-auto text-primary/40 mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2.25m0 4.5h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className='text-xl font-medium text-gray-700 mb-2'>Not Yet Implemented</h1>
          <p className='text-gray-500 max-w-sm mx-auto'>
            The screen for <span className='font-semibold text-gray-700'>{location.pathname}</span> is part of a future stage and is not yet available.
          </p>
        </div>
      </div>
    </PageContainer>
  );
};

export default Placeholder;
