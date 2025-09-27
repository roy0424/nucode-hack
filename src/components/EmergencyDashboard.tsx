import React from 'react';
import { ElderlyInfo, EmergencyEvent } from '../data/mockData';

interface EmergencyDashboardProps {
  elderlyInfo: ElderlyInfo;
  emergencyEvent: EmergencyEvent;
  onAcknowledge: () => void;
  onResolve: () => void;
}

const EmergencyDashboard: React.FC<EmergencyDashboardProps> = ({
  elderlyInfo,
  emergencyEvent,
  onAcknowledge,
  onResolve
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#DC2626'; // red
      case 'acknowledged': return '#D97706'; // amber
      case 'resolved': return '#16A34A'; // green
      default: return '#6B7280'; // gray
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '응급상황 발생';
      case 'acknowledged': return '확인됨';
      case 'resolved': return '해결됨';
      default: return '상태 불명';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
      zIndex: 1000
    }}>
      {/* iPhone 16 Pro 풀스크린 응급 대시보드 */}
      <div style={{
        maxWidth: '393px',
        height: '100vh',
        margin: '0 auto',
        backgroundColor: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        {/* Status Bar Space */}
        {/* <div style={{ height: '40px', backgroundColor: getStatusColor(emergencyEvent.status)}}></div> */}

        {/* Emergency Alert Header */}
        <div style={{
          backgroundColor: getStatusColor(emergencyEvent.status),
          color: 'white',
          padding: '20px',
          textAlign: 'center',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '40px'
        }}>
          {/* Pulsing Animation */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            animation: 'emergencyPulse 2s infinite'
          }}></div>

          <div style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <h1 style={{
              fontSize: '20px',
              fontWeight: '700',
              margin: '0 0 6px 0',
              textShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}>
              {getStatusText(emergencyEvent.status)}
            </h1>
            <p style={{
              margin: 0,
              fontSize: '13px',
              opacity: 0.9,
              fontWeight: '500'
            }}>
              {emergencyEvent.timestamp.toLocaleString('ko-KR')}
            </p>
          </div>
        </div>

        {/* Scrollable Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px'
        }}>

          {/* Patient Info */}
          <h2 style={{
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '12px',
              color: '#1F2937',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              환자 정보
            </h2>

          <div style={{
            backgroundColor: '#F8FAFC',
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '24px',
            border: '1px solid #E2E8F0'
          }}>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '12px',
              marginBottom: '12px'
            }}>
              <div>
                <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '2px' }}>이름</div>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>{elderlyInfo.name}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '2px' }}>나이</div>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>{elderlyInfo.age}세</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '2px' }}>혈액형</div>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>{elderlyInfo.bloodType}</div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '2px' }}>위치</div>
              <div style={{
                fontSize: '13px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                 {emergencyEvent.location}
              </div>
            </div>
          </div>

          {/* Important Medical Information */}
            <h2 style={{
              fontSize: '16px',
              fontWeight: '600',
              margin: '0 0 20px 0',
              color: '#1F2937'
            }}>
              중요 의료정보
            </h2>

            {/* Medical Conditions */}
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{
                fontSize: '14px',
                fontWeight: '600',
                margin: '-8px 0 8px 0',

              }}>
                기존 질환
              </h3>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
                paddingBottom: '12px'
              }}>
                {elderlyInfo.conditions.map((condition, index) => (
                  <span
                    key={index}
                    style={{
                      backgroundColor: '#FFF8C3',
                      fontSize: '12px',
                      fontWeight: '500',
                      padding: '4px 8px',
                      borderRadius: '11px',
                      border: '1px solid #FFF8C3'
                    }}
                  >
                    {condition}
                  </span>
                ))}
              </div>


            {/* Medications */}
            <div>
              <h3 style={{
                fontSize: '14px',
                fontWeight: '600',
                margin: '0 0 8px 0',

              }}>
                복용중인 약물
              </h3>
              <div style={{
                fontSize: '13px',
                lineHeight: '1.5',
                paddingLeft: '4',
                marginBottom: '24px'
              }}>
                {elderlyInfo.medications.map((medication, index) => (
                  <div key={index} style={{ marginBottom: '4px' }}>
                    • {medication}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Emergency Contacts */}
          <div style={{
            backgroundColor: '#EFF6FF',
            padding: '8px',
            borderRadius: '12px',
            marginBottom: '16px',
            border: '1px solid #DBEAFE'
          }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '8px',
              color: '#1E40AF'
            }}>
              긴급 연락처
            </h3>

            {elderlyInfo.emergencyContacts.slice(0, 2).map((contact, index) => (
              <a
                key={index}
                href={`tel:${contact.phone}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 10px',
                  backgroundColor: contact.isPrimary ? '#3B82F6' : '#FFFFFF',
                  color: contact.isPrimary ? '#FFFFFF' : '#1F2937',
                  borderRadius: '8px',
                  marginBottom: index < Math.min(elderlyInfo.emergencyContacts.length, 2) - 1 ? '6px' : 0,
                  textDecoration: 'none',
                  border: contact.isPrimary ? 'none' : '1px solid #E5E7EB',
                  fontSize: '13px'
                }}
              >
                <div style={{ fontWeight: '600' }}>
                  {contact.name} ({contact.relationship})
                  {contact.isPrimary && (
                    <span style={{
                      marginLeft: '4px',
                      fontSize: '9px',
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      padding: '1px 4px',
                      borderRadius: '3px'
                    }}>
                      주
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '16px' }}>📞</div>
              </a>
            ))}
          </div>
        </div>

        {/* Fixed Bottom Actions */}
        <div style={{
          position: 'sticky',
          bottom: 0,
          backgroundColor: '#FFFFFF',
          padding: '20px',
          borderTop: '1px solid #E5E7EB',
          boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {emergencyEvent.status === 'active' && (
              <button
                onClick={onAcknowledge}
                style={{
                  backgroundColor: '#F59E0B',
                  color: 'white',
                  padding: '16px',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  width: '100%',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                  transition: 'all 0.2s'
                }}
              >
                ⚠️ 상황 확인
              </button>
            )}

            {(emergencyEvent.status === 'active' || emergencyEvent.status === 'acknowledged') && (
              <button
                onClick={onResolve}
                style={{
                  backgroundColor: '#059669',
                  color: 'white',
                  padding: '16px',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  width: '100%',
                  boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
                  transition: 'all 0.2s'
                }}
              >
                ✅ 상황 해결
              </button>
            )}
          </div>

          {/* Device Info */}
          {/* {emergencyEvent.deviceBatteryLevel && (
            <div style={{
              marginTop: '12px',
              padding: '8px 12px',
              backgroundColor: '#F3F4F6',
              borderRadius: '8px',
              fontSize: '12px',
              textAlign: 'center',
              color: '#6B7280'
            }}>
              🔋 기기 배터리: {emergencyEvent.deviceBatteryLevel}%
            </div>
          )} */}
        </div>
      </div>

      {/* CSS Animations */}
      <style>
        {`
          @keyframes emergencyPulse {
            0%, 100% {
              transform: translate(-50%, -50%) scale(1);
              opacity: 0.7;
            }
            50% {
              transform: translate(-50%, -50%) scale(1.1);
              opacity: 0.3;
            }
          }
        `}
      </style>
    </div>
  );
};

export default EmergencyDashboard;