import React from 'react';

const PageContainer = ({ children, className = '' }) => {
  return (
    <div className={`p-4 sm:p-5 md:p-6 lg:p-8 w-full max-w-[1920px] mx-auto ${className}`}>
      {children}
    </div>
  );
};

export default PageContainer;
