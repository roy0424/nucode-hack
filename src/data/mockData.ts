// Mock data for elderly emergency IoT service

export interface ElderlyInfo {
  id: string;
  name: string;
  age: number;
  bloodType: string;
  allergies: string[];
  medications: string[];
  conditions: string[];
  emergencyContacts: EmergencyContact[];
  location: string;
  photoUrl?: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  isPrimary: boolean;
}

export interface EmergencyEvent {
  id: string;
  elderlyId: string;
  timestamp: Date;
  location: string;
  status: 'active' | 'acknowledged' | 'resolved';
  deviceBatteryLevel?: number;
}

export const mockElderlyInfo: ElderlyInfo = {
  id: "elderly-001",
  name: "김영희",
  age: 75,
  bloodType: "A+",
  allergies: ["페니실린", "새우", "견과류"],
  medications: [
    "혈압약 (아모텐 5mg) - 1일 1회 아침",
    "당뇨약 (메트포민 500mg) - 1일 2회",
    "혈액순환개선제 - 1일 1회 저녁"
  ],
  conditions: ["고혈압", "제2형 당뇨병", "경미한 치매"],
  emergencyContacts: [
    {
      name: "김철수",
      relationship: "아들",
      phone: "010-1234-5678",
      isPrimary: true
    },
    {
      name: "박영숙",
      relationship: "딸",
      phone: "010-9876-5432",
      isPrimary: false
    },
    {
      name: "이말순",
      relationship: "이웃",
      phone: "010-5555-1234",
      isPrimary: false
    }
  ],
  location: "서울시 강남구 테헤란로 123 행복아파트 101동 502호"
};

export const createMockEmergencyEvent = (): EmergencyEvent => ({
  id: `emergency-${Date.now()}`,
  elderlyId: mockElderlyInfo.id,
  timestamp: new Date(),
  location: "서울시 강남구 테헤란로 인근",
  status: 'active',
  deviceBatteryLevel: Math.floor(Math.random() * 100)
});