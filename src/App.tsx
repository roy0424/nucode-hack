import React, { useState, useCallback } from 'react';
import './App.css';
import BluetoothConnector from './components/BluetoothConnector';
import EmergencyDashboard from './components/EmergencyDashboard';
import { mockElderlyInfo, createMockEmergencyEvent, EmergencyEvent } from './data/mockData';

function App() {
  const [isDeviceConnected, setIsDeviceConnected] = useState(false);
  const [currentEmergency, setCurrentEmergency] = useState<EmergencyEvent | null>(null);
  const [emergencyHistory, setEmergencyHistory] = useState<EmergencyEvent[]>([]);

  const handleEmergencySignal = useCallback(() => {
    const newEmergency = createMockEmergencyEvent();
    setCurrentEmergency(newEmergency);
    setEmergencyHistory(prev => [newEmergency, ...prev]);

    // Play emergency sound (optional)
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('응급상황이 발생했습니다.');
      utterance.lang = 'ko-KR';
      speechSynthesis.speak(utterance);
    }
  }, []);

  const handleAcknowledge = useCallback(() => {
    if (currentEmergency) {
      const updatedEmergency = { ...currentEmergency, status: 'acknowledged' as const };
      setCurrentEmergency(updatedEmergency);
      setEmergencyHistory(prev =>
        prev.map(e => e.id === updatedEmergency.id ? updatedEmergency : e)
      );
    }
  }, [currentEmergency]);

  const handleResolve = useCallback(() => {
    if (currentEmergency) {
      const updatedEmergency = { ...currentEmergency, status: 'resolved' as const };
      setCurrentEmergency(null);
      setEmergencyHistory(prev =>
        prev.map(e => e.id === updatedEmergency.id ? updatedEmergency : e)
      );
    }
  }, [currentEmergency]);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F8FAFC',
      width: '100%',
      margin: 0,
      padding: 0,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* iPhone 16 Pro: 393×852 points */}
      <div style={{
        maxWidth: '393px',
        minHeight: '852px',
        margin: '0 auto',
        backgroundColor: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Status Bar Space */}
        <div style={{ height: '47px', backgroundColor: '#FFFFFF' }}></div>

        {/* Header with Logo */}
        <header style={{
          backgroundColor: '#FFFFFF',
          padding: '16px 20px',
          borderBottom: '1px solid #E5E7EB',
          position: 'sticky',
          top: '47px',
          zIndex: 10
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <img
                src="/image.png"
                alt="Logo"
                style={{
                  width: '74px',
                  height: '40px',
                  objectFit: 'contain'
                }}
              />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div style={{
          padding: '0 20px 20px 20px',
          height: 'calc(852px - 47px - 80px)',
          overflowY: 'auto'
        }}>

          {/* Patient Info Card */}
          <div style={{
            backgroundColor: '#FFFFFF',
            padding: '20px',
            borderRadius: '16px',
            marginTop: '16px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
            border: '1px solid #F1F5F9'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <h2 style={{
                fontSize: '16px',
                fontWeight: '600',
                margin: 0,
                color: '#1F2937'
              }}>
                등록된 환자 정보
              </h2>
            </div>

            {/* Patient Basic Info */}
            <div style={{
              backgroundColor: '#F8FAFC',
              padding: '16px',
              borderRadius: '12px',
              marginBottom: '12px'
            }}>
              {/* 이름, 나이, 혈액형을 한 줄에 */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '12px',
                fontSize: '14px'
              }}>
                <div>
                  <span style={{ color: '#6B7280', fontSize: '12px' }}>이름</span>
                  <div style={{ fontWeight: '600', color: '#1F2937' }}>{mockElderlyInfo.name}</div>
                </div>
                <div>
                  <span style={{ color: '#6B7280', fontSize: '12px' }}>나이</span>
                  <div style={{ fontWeight: '600', color: '#1F2937' }}>{mockElderlyInfo.age}세</div>
                </div>
                <div>
                  <span style={{ color: '#6B7280', fontSize: '12px' }}>혈액형</span>
                  <div style={{ fontWeight: '600', color: '#1F2937' }}>{mockElderlyInfo.bloodType}</div>
                </div>
              </div>

              {/* 주소는 아래 줄에 */}
              <div style={{ marginTop: '12px' }}>
                <span style={{ color: '#6B7280', fontSize: '12px' }}>주소</span>
                <div style={{
                  fontWeight: '500',
                  color: '#1F2937',
                  fontSize: '13px',
                  lineHeight: '1.4'
                }}>{mockElderlyInfo.location}</div>
              </div>
            </div>

          {/* Major Allergies Card */}
            <div style={{
              padding: '12px',
              backgroundColor: '#FFF5F5',
              borderRadius: '12px',
              fontSize: '13px'
            }}>
              <span style={{ fontWeight: '600', color: '#92400E' }}>주요 알레르기: </span>
              <span style={{ color: '#92400E' }}>{mockElderlyInfo.allergies.join(', ')}</span>
            </div>


          </div>

                    {/* Bluetooth Connection Card */}
                    <div style={{ marginTop: '20px' }}>
            <BluetoothConnector
              onEmergencySignal={handleEmergencySignal}
              onDeviceConnected={setIsDeviceConnected}
            />
          </div>

          {/* Emergency History */}
          {emergencyHistory.length > 0 && (
            <div style={{
              backgroundColor: '#FFFFFF',
              padding: '20px',
              borderRadius: '16px',
              marginTop: '16px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
              border: '1px solid #F1F5F9'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px'
              }}>
                <h2 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  margin: 0,
                  color: '#1F2937'
                }}>
                  응급상황 기록
                </h2>
              </div>

              {emergencyHistory.slice(0, 3).map((emergency) => (
                <div key={emergency.id} style={{
                  padding: '14px',
                  backgroundColor: '#F8FAFC',
                  marginBottom: '8px',
                  borderRadius: '12px',
                  border: `2px solid ${
                    emergency.status === 'active' ? '#FEE2E2' :
                    emergency.status === 'acknowledged' ? '#FEF3C7' : '#DCFCE7'
                  }`
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '6px'
                  }}>
                    <span style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: emergency.status === 'active' ? '#DC2626' :
                             emergency.status === 'acknowledged' ? '#D97706' : '#059669'
                    }}>
                      {emergency.status === 'active' ? '🚨 진행중' :
                       emergency.status === 'acknowledged' ? '확인됨' : '해결 완료'}
                    </span>
                    <span style={{ fontSize: '11px', color: '#6B7280' }}>
                      {emergency.timestamp.toLocaleTimeString('ko-KR')}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>
                    위치: {emergency.location}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Emergency Modal */}
      {currentEmergency && (
        <EmergencyDashboard
          elderlyInfo={mockElderlyInfo}
          emergencyEvent={currentEmergency}
          onAcknowledge={handleAcknowledge}
          onResolve={handleResolve}
        />
      )}
    </div>
  );
}

export default App;
