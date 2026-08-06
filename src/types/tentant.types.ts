export interface AttendencePolicy {
  id: number;
  tenantId: string;
  branchId: string;
  isEnabled: boolean;
  trackDailyAttendance: boolean;
  shiftManagementEnabled: boolean;
  clockInOutEnabled: boolean;
  breakTimeEnabled: boolean;
  lateArrivalTrackingEnabled: boolean;
  earlyLeavingTrackingEnabled: boolean;
  overtimeTrackingEnabled: boolean;
  leaveTrackingEnabled: boolean;
  holidayCalendarEnabled: boolean;
  graceMinutesLate: number;
  graceMinutesEarly: number;
  standardWorkMins: number;
  overtimeThresholdMins: number;
}
export type EmploymentType =
  | "full_time"
  | "part_time"
  | "hybrid"
  | "service_based"
  | "hourly_paid";
export type EmploymentStatus =
  | "active"
  | "on_probation"
  | "on_leave"
  | "suspended"
  | "resigned"
  | "terminated"

export interface StaffProfile {
  id: number;
  createdAt: string;
  tenantId: string;
  employeeCode: string | null;
  designation: string | null;
  skills: string[];
  commissionPct: number | null;
  joinedOn: string | null;
  ratingAvg: number | null;
  employmentType: EmploymentType;
  employmentStatus: EmploymentStatus;
  baseSalary: number | null;
  hourlyRate: number | null;
  overtimeRate: number | null;
  reportingManagerId: string | null;
}