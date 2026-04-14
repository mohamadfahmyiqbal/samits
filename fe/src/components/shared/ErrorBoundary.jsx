import React from 'react';
import { Result, Button, Typography, Space } from 'antd';
import {
 ReloadOutlined,
 HomeOutlined
} from '@ant-design/icons';

const { Text } = Typography;

class ErrorBoundary extends React.Component {
 constructor(props) {
  super(props);

  this.state = {
   hasError: false,
   error: null
  };
 }

 static getDerivedStateFromError(error) {
  return {
   hasError: true,
   error
  };
 }

 componentDidCatch(error, errorInfo) {
  console.error(
   'Error caught by boundary:',
   error,
   errorInfo
  );
 }

 handleRefresh = () => {
  window.location.reload();
 };

 handleGoHome = () => {
  window.location.href = '/';
 };

 render() {
  const { hasError, error } = this.state;

  if (hasError) {
   return (
    <div
     style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      background: '#f5f7fa'
     }}
    >
     <Result
      status="500"
      title="500"
      subTitle="Something went wrong. Please try again or return to the dashboard."
      extra={
       <Space wrap>
        <Button
         type="primary"
         icon={<ReloadOutlined />}
         onClick={this.handleRefresh}
         size="large"
        >
         Refresh Page
        </Button>

        <Button
         icon={<HomeOutlined />}
         onClick={this.handleGoHome}
         size="large"
        >
         Go Home
        </Button>
       </Space>
      }
     >
      {process.env.NODE_ENV === 'development' &&
       error && (
        <Text
         type="secondary"
         code
         style={{
          display: 'block',
          marginTop: 16,
          textAlign: 'left',
          whiteSpace: 'pre-wrap'
         }}
        >
         {error.stack}
        </Text>
       )}
     </Result>
    </div>
   );
  }

  return this.props.children;
 }
}

export default ErrorBoundary;