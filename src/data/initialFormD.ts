import { FormDRecord, Employee } from '../types';

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function getDaysCountForMonth(monthName: string, year: number): number {
  const monthIndex = MONTHS.indexOf(monthName);
  if (monthIndex === -1) return 30;
  return new Date(year, monthIndex + 1, 0).getDate();
}

export function generateDefaultFormDRecord(
  emp: Employee,
  srNo: number,
  month: string,
  year: number
): FormDRecord {
  const totalDays = getDaysCountForMonth(month, year);
  const monthIndex = MONTHS.indexOf(month);
  const dailyAttendance: Record<number, string> = {};
  let presentDays = 0;

  for (let day = 1; day <= totalDays; day++) {
    const dateObj = new Date(year, monthIndex, day);
    const dayOfWeek = dateObj.getDay(); // 0 is Sunday
    
    if (dayOfWeek === 0) {
      // Sunday is Weekly Off
      dailyAttendance[day] = 'WO';
      presentDays += 1; // WO is paid off in statutory calculation
    } else {
      // Periodic presence: occasional leave or absent for realistic compliance testing
      if (srNo === 2 && day === 14) {
        dailyAttendance[day] = 'L'; // Paid Leave
        presentDays += 1;
      } else if (srNo === 3 && day === 21) {
        dailyAttendance[day] = 'HD'; // Half Day
        presentDays += 0.5;
      } else if (srNo === 5 && (day === 8 || day === 9)) {
        dailyAttendance[day] = 'A'; // Absent
      } else {
        dailyAttendance[day] = 'P'; // Present
        presentDays += 1;
      }
    }
  }

  const hours = Math.round(presentDays * 8);

  return {
    id: `form-d-${emp.id}-${month}-${year}`,
    srNo,
    empCode: emp.empCode,
    name: `${emp.name} ${emp.surname}`.trim(),
    placeOfWork: emp.jobLocation || 'Mumbai Works Yard',
    doj: emp.doj,
    month,
    year,
    dailyAttendance,
    summaryDays: presentDays,
    remarksNoOfHours: `${hours} Hours / Regular shift`,
    registerKeeperSignature: 'Ashraf Belal (Owner)',
  };
}

export function generateInitialFormDList(employees: Employee[], month: string, year: number): FormDRecord[] {
  return employees.map((emp, index) => generateDefaultFormDRecord(emp, index + 1, month, year));
}
