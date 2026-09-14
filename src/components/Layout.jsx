import { NavLink, Route, Routes } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Dashboard from '../pages/Dashboard.jsx'
import Employees from '../pages/Employees.jsx'
import EmployeeDetail from '../pages/EmployeeDetail.jsx'
import Attendance from '../pages/Attendance.jsx'
import Leaves from '../pages/Leaves.jsx'
import Wages from '../pages/Wages.jsx'
import Statutory from '../pages/Statutory.jsx'
import Reports from '../pages/Reports.jsx'
import { employees, attendance } from '../data/mock.js'

const navItems = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/employees', label: 'Employees' },
  { to: '/attendance', label: 'Attendance' },
  { to: '/leaves', label: 'Leave' },
  { to: '/reports', label: 'Monthly Reports' },
]

const today = new Date().toISOString().slice(0, 10)

function isAttendanceComplete(rows) {
  return employees.filter((e) => e.status === 'active').every((e) => rows.some((a) => a.employee_id === e.id && a.date === today))
}

export default function Layout() {
  const [attendanceRows, setAttendanceRows] = useState(attendance)

  useEffect(() => {
    const handler = (e) => setAttendanceRows(e.detail)
    window.addEventListener('attendance-updated', handler)
    return () => window.removeEventListener('attendance-updated', handler)
  }, [])

  const attendanceIncomplete = !isAttendanceComplete(attendanceRows)

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className={`brand ${attendanceIncomplete ? 'blink' : ''}`}>HR Portal</div>
        <nav>
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => (isActive ? 'active' : '')}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/employees/:id" element={<EmployeeDetail />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/leaves" element={<Leaves />} />
          <Route path="/wages" element={<Wages />} />
          <Route path="/statutory" element={<Statutory />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </main>
    </div>
  )
}
