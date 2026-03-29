import React from 'react';
import { Card, Row, Col, Typography } from 'antd';

const { Title } = Typography;

const PageLayout = ({ title, subtitle, children, extra }) => {
  return (
    <div className="page-layout">
      <div className="page-header">
        <div className="header-content">
          <div className="header-left">
            <Title level={2}>{title}</Title>
            {subtitle && <p className="page-subtitle">{subtitle}</p>}
          </div>
          {extra && <div className="header-right">{extra}</div>}
        </div>
      </div>
      <div className="page-content">
        {children}
      </div>
    </div>
  );
};

export default PageLayout;
