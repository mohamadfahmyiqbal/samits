import React from 'react';
import { Spin } from 'antd';

const sizeMap = {
  small: 'small',
  medium: 'default',
  large: 'large',
};

const Loader = ({ fullScreen = false, size = 'medium', tip = 'Memuat...' }) => {
  const spinSize = sizeMap[size] || 'default';

  return (
    <div
      className={`flex flex-col items-center justify-center ${
        fullScreen ? 'min-h-screen' : 'min-h-[200px]'
      } p-8`}
    >
      <Spin size={spinSize} />
      {tip && <div className='mt-4 text-sm text-gray-500 dark:text-gray-400'>{tip}</div>}
    </div>
  );
};

export default Loader;

