import React, { useState, useCallback } from 'react';

// SOS 보드 블루투스 상수
const SOS_SERVICE_UUID = '91bad492-b950-4226-aa2b-4ede9fa42f59';
const SOS_TX_CHAR_UUID = 'cba1d466-344c-4be3-ab3f-189f80dd7518'; // Device -> App (notify)
const SOS_RX_CHAR_UUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e'; // App -> Device (write)

interface BluetoothConnectorProps {
  onEmergencySignal: () => void;
  onDeviceConnected: (connected: boolean) => void;
}

const BluetoothConnector: React.FC<BluetoothConnectorProps> = ({
  onEmergencySignal,
  onDeviceConnected
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [device, setDevice] = useState<BluetoothDevice | null>(null);
  const [error, setError] = useState<string>('');
  const [txCharacteristic, setTxCharacteristic] = useState<any>(null); // TX (Device -> App, notify)
  const [rxCharacteristic, setRxCharacteristic] = useState<any>(null); // RX (App -> Device, write)

  // ACK 전송 함수 (RX 특성으로 전송) - 최고 우선순위
  const sendAck = useCallback((seq: number) => {
    console.log('🔍🔍🔍 [ACK 전송] 상태 확인 시작 🔍🔍🔍');
    console.log('🔍 rxCharacteristic 상태:', !!rxCharacteristic);
    console.log('🔍 rxCharacteristic 객체:', rxCharacteristic);
    console.log('🔍 txCharacteristic 상태:', !!txCharacteristic);
    console.log('🔍 isConnected:', isConnected);
    console.log('🔍 device 상태:', !!device);
    console.log('🔍 device.gatt?.connected:', device?.gatt?.connected);

    if (!rxCharacteristic) {
      console.error('❌❌❌ RX Characteristic not available for ACK ❌❌❌');
      console.error('❌ 이는 연결 과정에서 RX Characteristic 설정이 실패했음을 의미합니다.');
      console.error('❌ 기기 연결을 다시 시도해보세요.');

      // 즉시 RX Characteristic 재획득 시도
      if (device?.gatt?.connected) {
        console.log('🔄 RX Characteristic 재획득 시도...');
        (async () => {
          try {
            const service = await (device.gatt as any).getPrimaryService(SOS_SERVICE_UUID);
            const newRxChar = await (service as any).getCharacteristic(SOS_RX_CHAR_UUID);
            setRxCharacteristic(newRxChar);
            console.log('✅ RX Characteristic 재획득 성공');

            // 재시도
            const ackMessage = `ACK:${seq}`;
            const encoder = new TextEncoder();
            const data = encoder.encode(ackMessage);
            await newRxChar.writeValue(data);
            console.log('✅ ACK 재전송 성공!');
          } catch (error) {
            console.error('❌ RX Characteristic 재획득 실패:', error);
          }
        })();
      }
      return;
    }

    const ackMessage = `ACK:${seq}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(ackMessage);

    // 디버깅: 전송할 데이터 정보
    console.log('📤📤📤 [ACK 전송] ACK 전송 시작! 📤📤📤');
    console.log(`📤 [ACK 전송] 메시지: "${ackMessage}" (${data.length} bytes)`);
    console.log('📤 [ACK 전송] 바이트 배열:', Array.from(data).map(b => b.toString(16).padStart(2, '0')).join(' '));
    console.log('📤 [ACK 전송] 타임스탬프:', new Date().toLocaleTimeString());

    // Write Without Response 사용 (더 빠름)
    const writePromise = (rxCharacteristic as any).writeValueWithoutResponse ?
      (rxCharacteristic as any).writeValueWithoutResponse(data) :
      rxCharacteristic.writeValue(data);

    writePromise
      .then(() => {
        console.log('✅✅✅ [ACK 전송] ACK 전송 성공! ✅✅✅');
        console.log(`✅ [ACK 전송] 전송 완료: ${ackMessage}`);
        console.log('✅ [ACK 전송] 완료 타임스탬프:', new Date().toLocaleTimeString());
      })
      .catch(async (error: any) => {
        console.error('❌❌❌ [ACK 전송] ACK 전송 실패! ❌❌❌');
        console.error('❌ [ACK 전송] 실패 메시지:', ackMessage);
        console.error('❌ [ACK 전송] 에러:', error);

        // InvalidStateError인 경우 characteristic 재획득 시도
        if (error.name === 'InvalidStateError' && error.message.includes('no longer valid')) {
          console.log('🔄 Characteristic 무효화됨 - 재획득 시도...');
          try {
            if (device?.gatt?.connected) {
              const service = await (device.gatt as any).getPrimaryService(SOS_SERVICE_UUID);
              const newRxChar = await (service as any).getCharacteristic(SOS_RX_CHAR_UUID);
              setRxCharacteristic(newRxChar);
              console.log('✅ RX Characteristic 재획득 성공');

              // 재시도
              console.log('🔄 ACK 전송 재시도...');
              await newRxChar.writeValue(data);
              console.log('✅ ACK 재전송 성공!');
            } else {
              console.error('❌ 기기가 연결되지 않아 재획득 불가');
            }
          } catch (retryError) {
            console.error('❌ Characteristic 재획득 실패:', retryError);
          }
        }
      });
  }, [rxCharacteristic]);

  const connectToDevice = useCallback(async () => {
    if (!navigator.bluetooth) {
      setError('이 브라우저는 Bluetooth를 지원하지 않습니다.');
      return;
    }

    setIsConnecting(true);
    setError('');

    try {
      // Request Bluetooth device
      const bluetoothDevice = await navigator.bluetooth.requestDevice({
        filters: [
          { name: 'SOS' },
          { namePrefix: 'SOS' },
          { services: [SOS_SERVICE_UUID] }
        ],
        optionalServices: [SOS_SERVICE_UUID]
      });

      setDevice(bluetoothDevice);

      // Connect to GATT server
      const server = await bluetoothDevice.gatt?.connect();

      if (server) {
        setIsConnected(true);
        onDeviceConnected(true);

        // Listen for disconnect
        bluetoothDevice.addEventListener('gattserverdisconnected', () => {
          setIsConnected(false);
          onDeviceConnected(false);
        });

        // SOS 서비스 및 특성 설정
        try {
          console.log('🔗 SOS 서비스 연결 시도...');
          const service = await (server as any).getPrimaryService(SOS_SERVICE_UUID);
          console.log('✅ SOS 서비스 연결 성공');

          // TX 특성 (Device -> App, notify) - 이벤트 수신용
          console.log('🔗 TX Characteristic 연결 시도...');
          const txChar = await (service as any).getCharacteristic(SOS_TX_CHAR_UUID);
          console.log('✅ TX Characteristic 연결 성공');
          setTxCharacteristic(txChar);

          // RX 특성 (App -> Device, write) - ACK 전송용
          console.log('🔗 RX Characteristic 연결 시도...');
          const rxChar = await (service as any).getCharacteristic(SOS_RX_CHAR_UUID);
          console.log('✅ RX Characteristic 연결 성공');
          setRxCharacteristic(rxChar);

          // TX 특성 알림 활성화
          await (txChar as any).startNotifications();

          // 이벤트 수신 리스너 (EVT:seq 형태)
          console.log('🎧 이벤트 리스너 등록 중...');
          (txChar as any).addEventListener('characteristicvaluechanged', (event: any) => {
            const value = event.target.value;
            const decoder = new TextDecoder('utf-8');
            const message = decoder.decode(value).trim();

            // 디버깅: 수신 데이터 상세 정보
            const bytes = new Uint8Array(value.buffer);
            console.log('🔔🔔🔔 [이벤트 수신] 블루투스 이벤트 발생! 🔔🔔🔔');
            console.log(`📨 [이벤트 수신] 메시지: "${message}" (${bytes.length} bytes)`);
            console.log('📨 [이벤트 수신] 바이트 배열:', Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(' '));
            console.log('📨 [이벤트 수신] 타임스탬프:', new Date().toLocaleTimeString());

            // EVT:seq 형태 파싱
            if (message.startsWith('EVT:')) {
              const seqStr = message.substring(4); // "EVT:" 이후 부분
              const seq = parseInt(seqStr, 10);

              if (!isNaN(seq)) {
                console.log(`🚨 SOS 이벤트 수신 성공! (seq: ${seq})`);

                // 최우선: 응급 팝업 즉시 띄우기
                console.log('🚨 응급 팝업 즉시 띄우기...');
                onEmergencySignal();

                // 즉시 ACK 응답 전송 (지연 없음)
                console.log('📤 ACK 즉시 전송...');

                // 직접 RX Characteristic 찾아서 ACK 전송
                (async () => {
                  try {
                    console.log('🔍 ACK 전송 전 device 상태 확인...');
                    console.log('🔍 device:', device);
                    console.log('🔍 device?.gatt:', device?.gatt);
                    console.log('🔍 device?.gatt?.connected:', device?.gatt?.connected);
                    console.log('🔍 bluetoothDevice:', bluetoothDevice);
                    console.log('🔍 bluetoothDevice.gatt?.connected:', bluetoothDevice.gatt?.connected);

                    // device 대신 bluetoothDevice 사용
                    if (bluetoothDevice?.gatt?.connected) {
                      const service = await (bluetoothDevice.gatt as any).getPrimaryService(SOS_SERVICE_UUID);
                      const rxChar = await (service as any).getCharacteristic(SOS_RX_CHAR_UUID);

                      const ackMessage = `ACK:${seq}`;
                      const encoder = new TextEncoder();
                      const data = encoder.encode(ackMessage);

                      console.log('📤📤📤 [ACK 직접전송] ACK 전송 시작! 📤📤📤');
                      console.log(`📤 [ACK 직접전송] 메시지: "${ackMessage}"`);

                      await rxChar.writeValue(data);
                      console.log('✅✅✅ [ACK 직접전송] ACK 전송 성공! ✅✅✅');
                    } else {
                      console.error('❌ 기기가 연결되지 않음');
                    }
                  } catch (ackError) {
                    console.error('❌ ACK 직접전송 실패:', ackError);
                  }
                })();
              } else {
                console.warn('❌ 잘못된 seq 형태:', message);
              }
            } else {
              console.warn('❌ 알 수 없는 메시지 형태:', message);
            }
          });
          console.log('✅ 이벤트 리스너 등록 완료');

          console.log('🎉🎉🎉 SOS 기기 연결 완료! 🎉🎉🎉');
          console.log('🎉 기기명:', bluetoothDevice.name);
          console.log('🎉 TX Characteristic 객체:', txChar);
          console.log('🎉 RX Characteristic 객체:', rxChar);
          console.log('🎉 TX Characteristic 설정됨:', !!txChar);
          console.log('🎉 RX Characteristic 설정됨:', !!rxChar);
        } catch (serviceError: any) {
          console.error('❌❌❌ Service/Characteristic 설정 실패! ❌❌❌');
          console.error('❌ 에러:', serviceError);
          console.error('❌ 에러 타입:', serviceError.name);
          console.error('❌ 에러 메시지:', serviceError.message);

          // RX Characteristic이 설정되지 않았다면 상태 확인
          if (!rxCharacteristic) {
            console.error('❌ RX Characteristic이 설정되지 않았습니다!');
            console.error('❌ 이로 인해 ACK 전송이 불가능합니다.');
          }

          setError(`특성 설정 실패: ${serviceError.message}`);
          console.log('⚠️ SOS 기기 기본 모드 연결:', bluetoothDevice.name);
        }
      }
    } catch (err: any) {
      console.error('Bluetooth connection failed:', err);
      setError(`연결 실패: ${err.message}`);
    } finally {
      setIsConnecting(false);
    }
  }, [onDeviceConnected]);

  const disconnect = useCallback(() => {
    if (device && device.gatt?.connected) {
      device.gatt.disconnect();
    }
    setDevice(null);
    setTxCharacteristic(null);
    setRxCharacteristic(null);
    setIsConnected(false);
    onDeviceConnected(false);
  }, [device, onDeviceConnected]);

  // Simulate emergency button press for demo
  const simulateEmergency = useCallback(() => {
    onEmergencySignal();
  }, [onEmergencySignal]);

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      padding: '20px',
      borderRadius: '16px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
      border: '1px solid #F1F5F9'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '16px'
      }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          margin: 0,
          color: '#1F2937'
        }}>
          IoT 응급 기기 연결
        </h3>
      </div>

      {/* Connection Status */}
      <div style={{
        backgroundColor: '#F8FAFC',
        padding: '16px',
        borderRadius: '12px',
        marginBottom: '16px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px'
        }}>
          <span style={{
            fontSize: '13px',
            fontWeight: '600',
            color: '#1F2937'
          }}>
            연결 상태
          </span>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isConnected ? '#10B981' : '#EF4444'
            }}></div>
            <span style={{
              fontSize: '12px',
              fontWeight: '600',
              color: isConnected ? '#059669' : '#DC2626'
            }}>
              {isConnected ? '연결됨' : '연결 안됨'}
            </span>
          </div>
        </div>

        {device && (
          <div style={{
            fontSize: '12px',
            color: '#6B7280'
          }}>
            기기명: {device.name || '알 수 없음'}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        marginBottom: '16px'
      }}>
        {!isConnected ? (
          <button
            onClick={connectToDevice}
            disabled={isConnecting}
            style={{
              backgroundColor: isConnecting ? '#9CA3AF' : '#3B82F6',
              color: 'white',
              padding: '14px 20px',
              borderRadius: '12px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '600',
              cursor: isConnecting ? 'not-allowed' : 'pointer',
              width: '100%',
              transition: 'all 0.2s'
            }}
          >
            {isConnecting ? '⏳ 연결 중...' : '🔗 SOS 기기 연결'}
          </button>
        ) : (
          <button
            onClick={disconnect}
            style={{
              backgroundColor: '#EF4444',
              color: 'white',
              padding: '14px 20px',
              borderRadius: '12px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              width: '100%',
              transition: 'all 0.2s'
            }}
          >
            연결 해제
          </button>
        )}

        {/* Emergency Simulation Button
        <button
          onClick={simulateEmergency}
          style={{
            backgroundColor: '#DC2626',
            color: 'white',
            padding: '16px 20px',
            borderRadius: '12px',
            border: 'none',
            fontSize: '15px',
            fontWeight: '700',
            cursor: 'pointer',
            width: '100%',
            animation: 'pulse 2s infinite',
            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
          }}
        >
          🚨 응급 상황 시뮬레이션
        </button> */}
      </div>

      {error && (
        <div style={{
          backgroundColor: '#FEE2E2',
          color: '#DC2626',
          padding: '12px',
          borderRadius: '6px',
          fontSize: '14px'
        }}>
          ⚠️ {error}
        </div>
      )}

      <style>
        {`
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
        `}
      </style>
    </div>
  );
};

export default BluetoothConnector;