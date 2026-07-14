export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number; // in minutes
  description: string;
  image: string;
}

export interface Barber {
  id: string;
  name: string;
  specialty: string;
  image: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export type AppointmentStatus = 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface Appointment {
  id: string;
  serviceId: string;
  barberId: string;
  date: string;
  time: string;
  customerName: string;
  customerPhone: string;
  status: AppointmentStatus;
  paymentMethodId?: string;
}

export interface BlockedTime {
  id: string;
  barberId: string;
  date: string;
  time: string | 'ALL_DAY';
  reason?: string;
}

export interface AppNotification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string; // ISO string
}

export interface User {
  name: string;
  phone: string;
}

export interface HomepageConfig {
  heroTitle: string;
  heroSubtitle: string;
  tagline: string;
  bgUrl: string;
  feature1Title: string;
  feature1Desc: string;
  feature2Title: string;
  feature2Desc: string;
  feature3Title: string;
  feature3Desc: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  active: boolean;
  details?: string;
  bankId?: string; // bank/gateway identifier
  apiKey?: string;
  clientId?: string;
  clientSecret?: string;
  sandbox?: boolean;
}

export enum AppView {
  HOME = 'HOME',
  BOOKING = 'BOOKING',
  AI_STYLIST = 'AI_STYLIST',
  MY_APPOINTMENTS = 'MY_APPOINTMENTS',
  ADMIN = 'ADMIN'
}