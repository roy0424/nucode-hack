# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

고령자 응급 건강정보 IoT 서비스 - 해커톤 데모용 웹애플리케이션

독거 고령자의 응급상황 시 버튼 하나로 건강정보를 즉시 전달하여 신속한 응급대응을 가능하게 하는 서비스입니다.

## Common Commands

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

## Architecture Overview

### Core Components

- **App.tsx**: 메인 애플리케이션 컴포넌트 - 상태 관리 및 전체 UI 구성
- **BluetoothConnector.tsx**: IoT 기기와의 블루투스 연동 및 응급신호 시뮬레이션
- **EmergencyDashboard.tsx**: 응급상황 발생시 팝업되는 의료진/보호자용 대시보드
- **mockData.ts**: 데모용 Mock 데이터 (환자 정보, 응급상황 이벤트)

### Data Flow

1. **응급신호 발생**: 블루투스 기기 또는 시뮬레이션 버튼
2. **상태 업데이트**: App 컴포넌트에서 응급이벤트 생성 및 히스토리 관리
3. **대시보드 표시**: 응급정보 모달 팝업으로 핵심 의료정보 제공
4. **상태 전환**: 확인 → 해결 단계별 상태 관리

### Key Features

- **Web Bluetooth API**: 실제 IoT 하드웨어와의 연동 (Chrome 브라우저 필요)
- **Mock Data**: 백엔드 없이 프론트엔드만으로 완전한 데모 구현
- **실시간 UI**: 응급상황 발생시 즉시 음성 알림 및 시각적 피드백
- **응급정보 표시**: 알레르기, 복용약물, 기존질환 등 생명에 중요한 정보 우선 표시

## Development Notes

### Browser Compatibility

- Web Bluetooth API는 Chrome 계열 브라우저에서만 동작
- 데모 시연시에는 Chrome 브라우저 사용 필수

### Mock Data Structure

```typescript
// ElderlyInfo: 고령자 기본정보 및 의료정보
// EmergencyEvent: 응급상황 이벤트 (발생시간, 위치, 상태)
// EmergencyContact: 긴급연락처 (가족, 이웃, 의료진)
```

### Styling

- CSS-in-JS 방식으로 컴포넌트별 인라인 스타일링
- 응급상황의 시각적 임팩트를 위한 색상 코딩
- 모바일/태블릿 반응형 디자인 고려

### Future Enhancements

실제 상용화 시 고려사항:
- 실제 IoT 하드웨어와의 LTE-M/NB-IoT 통신
- 병원 EMR 시스템과의 API 연동
- 개인정보 보호를 위한 암호화 및 접근권한 관리
- GPS를 통한 정확한 위치 추적