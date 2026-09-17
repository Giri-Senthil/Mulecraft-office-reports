import { NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Dashboard from '../pages/Dashboard.jsx'
import Employees from '../pages/Employees.jsx'
import EmployeeDetail from '../pages/EmployeeDetail.jsx'
import Attendance from '../pages/Attendance.jsx'
import Wages from '../pages/Wages.jsx'
import Statutory from '../pages/Statutory.jsx'
import Reports from '../pages/Reports.jsx'
import { supabase } from '../lib/supabase.js'

const navItems = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/employees', label: 'Employees' },
  { to: '/attendance', label: 'Attendance' },
  { to: '/reports', label: 'Monthly Reports' },
]

const today = new Date().toISOString().slice(0, 10)

function isAttendanceComplete(rows, employees) {
  return employees.filter((e) => e.status === 'active').every((e) => rows.some((a) => a.employee_id === e.id && a.date === today))
}

export default function Layout() {
  const [attendanceRows, setAttendanceRows] = useState([])
  const [employees, setEmployees] = useState([])
  const location = useLocation()

  useEffect(() => {
    ;(async () => {
      const [attRes, empRes] = await Promise.all([
        supabase.from('attendance').select('*'),
        supabase.from('employees').select('*'),
      ])
      if (attRes.error) console.error(attRes.error)
      else setAttendanceRows(attRes.data)
      if (empRes.error) console.error(empRes.error)
      else setEmployees(empRes.data)
    })()
  }, [])

  useEffect(() => {
    const handler = (e) => setAttendanceRows(e.detail)
    window.addEventListener('attendance-updated', handler)
    return () => window.removeEventListener('attendance-updated', handler)
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  const attendanceIncomplete = !isAttendanceComplete(attendanceRows, employees)

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
        <Routes key={location.pathname}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/employees/:id" element={<EmployeeDetail />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/wages" element={<Wages />} />
          <Route path="/statutory" element={<Statutory />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </main>
    </div>
  )
}
