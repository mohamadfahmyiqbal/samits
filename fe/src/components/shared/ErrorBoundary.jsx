import React from 'react';
import { Result, Button, Typography, Space } from 'antd';
import {
 ReloadOutlined,
 HomeOutlined,
} from '@ant-design/icons';
import { Navigate } from 'react-router-dom';

const { Text } = Typography;

class ErrorBoundary extends React.Component {
 constructor(props) {
  super(props);

  this.state = {
   hasError: false,
   error: null,
   redirectHome: false,
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
  const { homePath = '/' } = this.props;
  this.setState({ redirectHome: true, homePath });
 };

 render() {
  const { hasError, error, redirectHome, homePath } = this.state;
 const {
   title = 'Terjadi kesalahan',
   description = 'Coba muat ulang halaman atau kembali ke beranda.',
   homeLabel = 'Ke beranda',
   refreshLabel = 'Muat ulang',
   resultStatus = '500',
  } = this.props;

  if (redirectHome) {
   return <Navigate to={homePath || '/'} replace />;
  }

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
      status={resultStatus}
      title={resultStatus}
      subTitle={description}
      extra={
       <Space wrap>
        <Button
         type="primary"
         icon={<ReloadOutlined />}
         onClick={this.handleRefresh}
         size="large"
        >
         {refreshLabel}
        </Button>

        <Button
         icon={<HomeOutlined />}
         onClick={this.handleGoHome}
         size="large"
        >
         {homeLabel}
        </Button>
       </Space>
      }
     >
      <Typography.Title level={4} style={{ marginTop: 0 }}>
       {title}
      </Typography.Title>
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
         {error.stack || error.message}
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
