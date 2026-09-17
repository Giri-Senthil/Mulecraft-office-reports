export const employees = [
  { id: 'e1', employee_code: 'EMP001', first_name: 'Aarav', last_name: 'Sharma', email: 'aarav.sharma@mulecraft.com', phone: '+91 98765 43210', department: 'Engineering', designation: 'Senior Software Engineer', status: 'active', date_of_joining: '2021-06-14' },
  { id: 'e2', employee_code: 'EMP002', first_name: 'Priya', last_name: 'Nair', email: 'priya.nair@mulecraft.com', phone: '+91 91234 56780', department: 'Design', designation: 'Product Designer', status: 'active', date_of_joining: '2022-03-01' },
  { id: 'e3', employee_code: 'EMP003', first_name: 'Rahul', last_name: 'Verma', email: 'rahul.verma@mulecraft.com', phone: '+91 99887 76655', department: 'Engineering', designation: 'Backend Developer', status: 'active', date_of_joining: '2023-01-09' },
  { id: 'e4', employee_code: 'EMP004', first_name: 'Sneha', last_name: 'Iyer', email: 'sneha.iyer@mulecraft.com', phone: '+91 90000 11122', department: 'HR', designation: 'HR Executive', status: 'active', date_of_joining: '2022-08-22' },
  { id: 'e5', employee_code: 'EMP005', first_name: 'Vikram', last_name: 'Singh', email: 'vikram.singh@mulecraft.com', phone: '+91 91122 33445', department: 'Sales', designation: 'Account Manager', status: 'inactive', date_of_joining: '2020-11-02' },
  { id: 'e6', employee_code: 'EMP006', first_name: 'Ananya', last_name: 'Gupta', email: 'ananya.gupta@mulecraft.com', phone: '+91 92233 44556', department: 'Finance', designation: 'Finance Analyst', status: 'active', date_of_joining: '2023-05-15' },
]

export const employmentDetails = [
  { id: 'ed1', employee_id: 'e1', employment_type: 'full-time', contract_start: '2021-06-14', contract_end: null, probation_end: '2021-09-14', work_location: 'Bangalore', manager_name: 'Rohit Menon', notes: 'Permanent' },
  { id: 'ed2', employee_id: 'e2', employment_type: 'full-time', contract_start: '2022-03-01', contract_end: null, probation_end: '2022-06-01', work_location: 'Remote', manager_name: 'Rohit Menon', notes: '' },
  { id: 'ed3', employee_id: 'e3', employment_type: 'contract', contract_start: '2023-01-09', contract_end: '2024-12-31', probation_end: '2023-04-09', work_location: 'Bangalore', manager_name: 'Aarav Sharma', notes: 'Contract' },
  { id: 'ed4', employee_id: 'e4', employment_type: 'full-time', contract_start: '2022-08-22', contract_end: null, probation_end: '2022-11-22', work_location: 'Bangalore', manager_name: 'Rohit Menon', notes: '' },
  { id: 'ed5', employee_id: 'e5', employment_type: 'full-time', contract_start: '2020-11-02', contract_end: null, probation_end: '2021-02-02', work_location: 'Mumbai', manager_name: 'Rohit Menon', notes: 'Resigned' },
  { id: 'ed6', employee_id: 'e6', employment_type: 'full-time', contract_start: '2023-05-15', contract_end: null, probation_end: '2023-08-15', work_location: 'Bangalore', manager_name: 'Sneha Iyer', notes: '' },
]

export const wages = [
  { id: 'w1', employee_id: 'e1', effective_from: '2024-04-01', basic_pay: 60000, hra: 27000, allowances: 13000, deductions: 8000, gross_pay: 100000, net_pay: 92000, pay_frequency: 'monthly' },
  { id: 'w2', employee_id: 'e2', effective_from: '2024-04-01', basic_pay: 45000, hra: 20000, allowances: 10000, deductions: 6000, gross_pay: 75000, net_pay: 69000, pay_frequency: 'monthly' },
  { id: 'w3', employee_id: 'e3', effective_from: '2024-04-01', basic_pay: 50000, hra: 22000, allowances: 11000, deductions: 7000, gross_pay: 83000, net_pay: 76000, pay_frequency: 'monthly' },
  { id: 'w4', employee_id: 'e4', effective_from: '2024-04-01', basic_pay: 30000, hra: 13000, allowances: 7000, deductions: 4000, gross_pay: 50000, net_pay: 46000, pay_frequency: 'monthly' },
  { id: 'w5', employee_id: 'e5', effective_from: '2023-01-01', basic_pay: 40000, hra: 18000, allowances: 9000, deductions: 6000, gross_pay: 67000, net_pay: 61000, pay_frequency: 'monthly' },
  { id: 'w6', employee_id: 'e6', effective_from: '2024-04-01', basic_pay: 35000, hra: 15000, allowances: 8000, deductions: 5000, gross_pay: 58000, net_pay: 53000, pay_frequency: 'monthly' },
]

export const attendance = [
  { id: 'a1', employee_id: 'e1', date: '2026-09-01', status: 'present', check_in: '09:02', check_out: '18:05', hours_worked: 9.05, notes: '' },
  { id: 'a2', employee_id: 'e1', date: '2026-09-02', status: 'present', check_in: '08:58', check_out: '18:10', hours_worked: 9.2, notes: '' },
  { id: 'a3', employee_id: 'e1', date: '2026-09-03', status: 'leave', check_in: null, check_out: null, hours_worked: null, notes: 'Casual leave' },
  { id: 'a4', employee_id: 'e2', date: '2026-09-01', status: 'present', check_in: '09:15', check_out: '17:45', hours_worked: 8.5, notes: '' },
  { id: 'a5', employee_id: 'e2', date: '2026-09-02', status: 'absent', check_in: null, check_out: null, hours_worked: null, notes: 'No intimation' },
  { id: 'a6', employee_id: 'e3', date: '2026-09-01', status: 'present', check_in: '10:00', check_out: '19:00', hours_worked: 9, notes: '' },
  { id: 'a7', employee_id: 'e3', date: '2026-09-02', status: 'half-day', check_in: '09:30', check_out: '13:30', hours_worked: 4, notes: 'Medical appointment' },
  { id: 'a8', employee_id: 'e4', date: '2026-09-01', status: 'present', check_in: '09:05', check_out: '18:00', hours_worked: 8.9, notes: '' },
  { id: 'a9', employee_id: 'e4', date: '2026-09-02', status: 'present', check_in: '09:10', check_out: '18:15', hours_worked: 9.1, notes: '' },
  { id: 'a10', employee_id: 'e5', date: '2026-09-01', status: 'absent', check_in: null, check_out: null, hours_worked: null, notes: 'Resigned' },
  { id: 'a11', employee_id: 'e6', date: '2026-09-01', status: 'present', check_in: '09:00', check_out: '18:00', hours_worked: 9, notes: '' },
  { id: 'a12', employee_id: 'e6', date: '2026-09-02', status: 'present', check_in: '08:55', check_out: '17:50', hours_worked: 8.9, notes: '' },
]

export const workingHours = [
  { id: 'wh1', employee_id: 'e1', period_start: '2026-09-01', period_end: '2026-09-30', total_hours: 180, overtime_hours: 12, notes: '' },
  { id: 'wh2', employee_id: 'e2', period_start: '2026-09-01', period_end: '2026-09-30', total_hours: 160, overtime_hours: 0, notes: '' },
  { id: 'wh3', employee_id: 'e3', period_start: '2026-09-01', period_end: '2026-09-30', total_hours: 172, overtime_hours: 8, notes: '' },
  { id: 'wh4', employee_id: 'e4', period_start: '2026-09-01', period_end: '2026-09-30', total_hours: 176, overtime_hours: 4, notes: '' },
  { id: 'wh5', employee_id: 'e6', period_start: '2026-09-01', period_end: '2026-09-30', total_hours: 168, overtime_hours: 0, notes: '' },
]

export const leaves = [
  { id: 'l1', employee_id: 'e1', leave_type: 'casual', start_date: '2026-09-03', end_date: '2026-09-03', days: 1, reason: 'Family function', status: 'approved', applied_on: '2026-08-28', reviewed_by: 'Sneha Iyer', reviewed_on: '2026-08-29' },
  { id: 'l2', employee_id: 'e2', leave_type: 'sick', start_date: '2026-09-07', end_date: '2026-09-09', days: 3, reason: 'Fever', status: 'pending', applied_on: '2026-09-06', reviewed_by: null, reviewed_on: null },
  { id: 'l3', employee_id: 'e3', leave_type: 'earned', start_date: '2026-09-14', end_date: '2026-09-18', days: 5, reason: 'Vacation', status: 'pending', applied_on: '2026-09-05', reviewed_by: null, reviewed_on: null },
  { id: 'l4', employee_id: 'e4', leave_type: 'casual', start_date: '2026-09-21', end_date: '2026-09-22', days: 2, reason: 'Personal work', status: 'approved', applied_on: '2026-09-10', reviewed_by: 'Rohit Menon', reviewed_on: '2026-09-11' },
  { id: 'l5', employee_id: 'e6', leave_type: 'unpaid', start_date: '2026-09-25', end_date: '2026-09-26', days: 2, reason: 'Personal', status: 'rejected', applied_on: '2026-09-12', reviewed_by: 'Sneha Iyer', reviewed_on: '2026-09-13' },
]

export const statutory = [
  { id: 's1', employee_id: 'e1', pan: 'ABCDE1234F', aadhaar: '1234 5678 9012', uan: '101234567890', pf_number: 'KA/BLR/0012345', esi_number: 'ESIC/123456', bank_name: 'HDFC Bank', bank_account: '50100234567890', ifsc: 'HDFC0001234', tax_regime: 'new' },
  { id: 's2', employee_id: 'e2', pan: 'FGHIJ5678K', aadhaar: '2345 6789 0123', uan: '101234567891', pf_number: 'KA/BLR/0012346', esi_number: 'ESIC/123457', bank_name: 'ICICI Bank', bank_account: '00234567890123', ifsc: 'ICIC0002345', tax_regime: 'new' },
  { id: 's3', employee_id: 'e3', pan: 'KLMNO9012P', aadhaar: '3456 7890 1234', uan: '101234567892', pf_number: 'KA/BLR/0012347', esi_number: 'ESIC/123458', bank_name: 'SBI', bank_account: '34567890123456', ifsc: 'SBIN0003456', tax_regime: 'old' },
  { id: 's4', employee_id: 'e4', pan: 'PQRST3456U', aadhaar: '4567 8901 2345', uan: '101234567893', pf_number: 'KA/BLR/0012348', esi_number: 'ESIC/123459', bank_name: 'Axis Bank', bank_account: '45678901234567', ifsc: 'UTIB0004567', tax_regime: 'new' },
  { id: 's5', employee_id: 'e5', pan: 'UVWXY7890Z', aadhaar: '5678 9012 3456', uan: '101234567894', pf_number: 'KA/BLR/0012349', esi_number: 'ESIC/123460', bank_name: 'HDFC Bank', bank_account: '56789012345678', ifsc: 'HDFC0005678', tax_regime: 'old' },
  { id: 's6', employee_id: 'e6', pan: 'ZABCD1234E', aadhaar: '6789 0123 4567', uan: '101234567895', pf_number: 'KA/BLR/0012350', esi_number: 'ESIC/123461', bank_name: 'Kotak', bank_account: '67890123456789', ifsc: 'KKBK0006789', tax_regime: 'new' },
]

export const monthlyReports = [
  { id: 'r1', employee_id: 'e1', month: '2026-09-01', days_present: 21, days_absent: 0, days_leave: 1, total_hours: 180, overtime_hours: 12, gross_pay: 100000, net_pay: 92000 },
  { id: 'r2', employee_id: 'e2', month: '2026-09-01', days_present: 19, days_absent: 1, days_leave: 3, total_hours: 160, overtime_hours: 0, gross_pay: 75000, net_pay: 69000 },
  { id: 'r3', employee_id: 'e3', month: '2026-09-01', days_present: 20, days_absent: 0, days_leave: 5, total_hours: 172, overtime_hours: 8, gross_pay: 83000, net_pay: 76000 },
  { id: 'r4', employee_id: 'e4', month: '2026-09-01', days_present: 21, days_absent: 0, days_leave: 2, total_hours: 176, overtime_hours: 4, gross_pay: 50000, net_pay: 46000 },
  { id: 'r5', employee_id: 'e6', month: '2026-09-01', days_present: 20, days_absent: 0, days_leave: 2, total_hours: 168, overtime_hours: 0, gross_pay: 58000, net_pay: 53000 },
]

export const monthlyEmployeeMovement = [
  { id: 'm1', employee_name: 'Aarav Sharma', designation: 'Senior Software Engineer', reason: 'Joined', event_type: 'joined', event_date: '2026-01-05' },
  { id: 'm2', employee_name: 'Priya Nair', designation: 'Product Designer', reason: 'Joined', event_type: 'joined', event_date: '2026-02-10' },
  { id: 'm3', employee_name: 'Rahul Verma', designation: 'Backend Developer', reason: 'Joined', event_type: 'joined', event_date: '2026-03-15' },
  { id: 'm4', employee_name: 'Sneha Iyer', designation: 'HR Executive', reason: 'Joined', event_type: 'joined', event_date: '2026-04-20' },
  { id: 'm5', employee_name: 'Vikram Singh', designation: 'Account Manager', reason: 'Resigned', event_type: 'removed', event_date: '2026-05-02' },
  { id: 'm6', employee_name: 'Ananya Gupta', designation: 'Finance Analyst', reason: 'Joined', event_type: 'joined', event_date: '2026-05-15' },
  { id: 'm7', employee_name: 'Rohit Menon', designation: 'Engineering Manager', reason: 'Joined', event_type: 'joined', event_date: '2026-06-01' },
  { id: 'm8', employee_name: 'Kavya Reddy', designation: 'UI Designer', reason: 'Resigned', event_type: 'removed', event_date: '2026-06-18' },
  { id: 'm9', employee_name: 'Arjun Das', designation: 'Data Analyst', reason: 'Joined', event_type: 'joined', event_date: '2026-07-07' },
  { id: 'm10', employee_name: 'Meera Pillai', designation: 'Marketing Lead', reason: 'Joined', event_type: 'joined', event_date: '2026-08-12' },
  { id: 'm11', employee_name: 'Suresh Kumar', designation: 'DevOps Engineer', reason: 'Resigned', event_type: 'removed', event_date: '2026-08-25' },
  { id: 'm12', employee_name: 'Divya Menon', designation: 'QA Engineer', reason: 'Joined', event_type: 'joined', event_date: '2026-09-03' },
  { id: 'm13', employee_name: 'Nikhil Rao', designation: 'Backend Developer', reason: 'Joined', event_type: 'joined', event_date: '2026-09-10' },
  { id: 'm14', employee_name: 'Pooja Sharma', designation: 'HR Executive', reason: 'Resigned', event_type: 'removed', event_date: '2026-09-12' },
]

export function getEmployee(id) {
  return employees.find((e) => e.id === id)
}

export function getByEmployee(table, id) {
  return table.filter((row) => row.employee_id === id)
}
