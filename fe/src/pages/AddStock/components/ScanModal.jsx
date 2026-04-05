import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Modal, Button, Input, InputNumber, Space, message, Typography, Result, Alert } from 'antd';
import { BarcodeOutlined, CameraOutlined, QrcodeOutlined } from '@ant-design/icons';
// import html2canvas from 'html2canvas'; // Install: npm install html2canvas



const { Title, Text } = Typography;

const ScanModal = ({ visible, onScanSuccess, onCancel, currentPart }) => {
  const [scannedCode, setScannedCode] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [mode, setMode] = useState('manual'); // 'manual', 'camera', 'qr'
  const [isScanning, setIsScanning] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (visible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [visible]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && scannedCode.trim()) {
      handleScan();
    }
  }, [scannedCode]);

  const handleManualScan = useCallback(() => {
    handleScan();
  }, [scannedCode, quantity]);

  const handleScan = () => {
    if (!scannedCode.trim()) {
      message.warning('Masukkan barcode atau part code');
      return;
    }

    onScanSuccess({
      part_code: scannedCode.trim().toUpperCase(),
      quantity,
      timestamp: new Date().toISOString(),
    });

    setScannedCode('');
    setQuantity(1);
    message.success(`Scanned: ${scannedCode} x${quantity}`);
  };

  const captureScreen = useCallback(async () => {
    message.info('Screenshot mode - Install html2canvas untuk enable: npm install html2canvas');
  }, []);


  return (
    <Modal
      title={
        <Space>
          <BarcodeOutlined />
          <span>Stock Scanner {currentPart ? `- ${currentPart.part_code}` : ''}</span>
        </Space>
      }
      visible={visible}
      onCancel={onCancel}
      width={480}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Batal
        </Button>,
        <Button 
          key="scan" 
          type="primary" 
          icon={<BarcodeOutlined />} 
          onClick={handleManualScan}
          disabled={!scannedCode.trim()}
        >
          Scan & Hitung
        </Button>,
      ]}
      afterClose={() => {
        setScannedCode('');
        setQuantity(1);
      }}
    >
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div style={{ marginBottom: 20 }}>
          <Title level={4}>Pilih Mode Scan</Title>
          <Space wrap style={{ justifyContent: 'center' }}>
            <Button 
              size="middle" 
              icon={<QrcodeOutlined />} 
              onClick={() => setMode('qr')}
              type={mode === 'qr' ? 'primary' : 'default'}
            >
              QR Code
            </Button>
            <Button 
              size="middle" 
              icon={<CameraOutlined />} 
              onClick={captureScreen}
              loading={isScanning}
              disabled={isScanning}
              type={mode === 'camera' ? 'primary' : 'default'}
            >
              Screenshot
            </Button>
            <Button 
              size="middle" 
              onClick={() => setMode('manual')}
              type={mode === 'manual' ? 'primary' : 'default'}
            >
              Manual
            </Button>
          </Space>
        </div>

        {mode === 'manual' && (
          <>
            <Alert 
              message="Tekan Enter atau klik Scan setelah input barcode" 
              type="info" 
              showIcon 
              style={{ marginBottom: 16 }}
            />
            <Space direction="vertical" style={{ width: '100%' }}>
              <Input
                ref={inputRef}
                value={scannedCode}
                onChange={(e) => setScannedCode(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Scan atau ketik barcode/part code"
                prefix={<BarcodeOutlined />}
                size="large"
                autoFocus
              />
              <Space>
                <InputNumber 
                  min={1}
                  value={quantity}
                  onChange={setQuantity}
                  placeholder="Quantity"
                  style={{ width: 120 }}
                />
              </Space>
            </Space>
          </>
        )}

        {mode === 'qr' && (
          <Result
            icon={<QrcodeOutlined style={{ fontSize: 64, color: '#1890ff' }} />}
            title="QR Code Scanner"
            subTitle="Arahkan kamera ke QR code part. Fitur ini memerlukan akses kamera."
          />
        )}

        {currentPart && (
          <Alert
            message={`Current Part: ${currentPart.part_name}`}
            description={`Expected: ${currentPart.system_stock}`}
            type="success"
            showIcon
          />
        )}
      </div>
    </Modal>
  );
};

export default ScanModal;

