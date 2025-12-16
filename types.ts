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

export enum AppView {
  HOME = 'HOME',
  BOOKING = 'BOOKING',
  AI_STYLIST = 'AI_STYLIST',
  MY_APPOINTMENTS = 'MY_APPOINTMENTS',
  ADMIN = 'ADMIN'
}