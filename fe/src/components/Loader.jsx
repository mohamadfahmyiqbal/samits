import React from 'react';
import { Spin } from 'antd';

const Loader = ({ fullScreen = false, size = 'medium', tip = 'Loading...' }) => (
  <div className={`flex flex-col items-center justify-center ${fullScreen ? 'min-h-screen' : 'min-h-[200px]'} p-8`}>
    <Spin size={size} className="mb-4">
      {tip && <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">{tip}</div>}
    </Spin>
  </div>
);

export default Loader;

