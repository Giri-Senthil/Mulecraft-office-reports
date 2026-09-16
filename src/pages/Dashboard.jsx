import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'

export default function Dashboard() {
  const [employees, setEmployees] = useState([])
  const [attendance, setAttendance] = useState([])
  const [movement, setMovement] = useState([])

  useEffect(() => {
    ;(async () => {
      const [empRes, attRes, movRes] = await Promise.all([
        supabase.from('employees').select('*'),
        supabase.from('attendance').select('*'),
        supabase.from('monthly_employee_movement').select('*'),
      ])
      if (empRes.error) console.error(empRes.error)
      else setEmployees(empRes.data)
      if (attRes.error) console.error(attRes.error)
      else setAttendance(attRes.data)
      if (movRes.error) console.error(movRes.error)
      else setMovement(movRes.data)
    })()
  }, [])

  const today = new Date().toISOString().slice(0, 10)
  const absentToday = attendance.filter((a) => a.date === today && a.status === 'absent')

  const threeMonthsAgo = new Date()
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
  const cutoff = threeMonthsAgo.toISOString().slice(0, 10)

  const joined = movement
    .filter((m) => m.event_type === 'joined' && m.event_date >= cutoff)
    .sort((a, b) => b.event_date.localeCompare(a.event_date))

  const removed = movement
    .filter((m) => m.event_type === 'removed' && m.event_date >= cutoff)
    .sort((a, b) => b.event_date.localeCompare(a.event_date))

  const empById = Object.fromEntries(employees.map((e) => [e.employee_code, e]))

  const TYPE_COLORS = ['#1e8acb', '#1ab4b5', '#d97706', '#8b5cf6', '#16a34a', '#dc2626', '#0e53be', '#0db6f3', '#e8e8e8']
  const TECHNICAL_KEYWORDS = ['engineer', 'developer', 'analyst', 'devops', 'qa', 'data', 'architect', 'scientist']
  const isTechnical = (designation) => TECHNICAL_KEYWORDS.some((kw) => designation.toLowerCase().includes(kw))
  const typeCounts = {}
  employees.forEach((emp) => {
    const designation = emp.designation || 'Unknown'
    typeCounts[designation] = (typeCounts[designation] || 0) + 1
  })

  function Pie({ records, colors }) {
    const total = records.length
    if (total === 0) return <p className="muted">No data</p>
    let angle = 0
    const segments = records.map(({ label, count, color }) => {
      const start = angle
      const end = angle + (count / total) * 360
      angle = end
      const large = end - start > 180 ? 1 : 0
      const x1 = 50 + 45 * Math.cos((start * Math.PI) / 180)
      const y1 = 50 + 45 * Math.sin((start * Math.PI) / 180)
      const x2 = 50 + 45 * Math.cos((end * Math.PI) / 180)
      const y2 = 50 + 45 * Math.sin((end * Math.PI) / 180)
      return (
        <path key={label} d={`M50 50 L${x1} ${y1} A45 45 0 ${large} 1 ${x2} ${y2} Z`} fill={color} />
      )
    })
    return (
      <svg viewBox="0 0 100 100" className="pie">
        {segments}
      </svg>
    )
  }

  const typeData = Object.entries(typeCounts).map(([label, count], i) => ({ label, count, color: TYPE_COLORS[i % TYPE_COLORS.length] }))
  const technical = typeData.filter((d) => isTechnical(d.label)).sort((a, b) => b.count - a.count)
  const nonTechnical = typeData.filter((d) => !isTechnical(d.label)).sort((a, b) => b.count - a.count)

  return (
    <div>
      <h1>Dashboard</h1>

      <div className="dashboard-pie">
        <div className="card pie-card">
          <h2 className="chart-title">Employees by Designation</h2>
          <Pie records={typeData} colors={TYPE_COLORS} />
          <div className="pie-legend">
            {technical.length > 0 && (
              <div className="legend-group">
                <div className="legend-group-title">Technical Roles</div>
                {technical.map((d) => (
                  <span key={d.label}><i className="dot" style={{ background: d.color }}></i> {d.label} ({d.count})</span>
                ))}
              </div>
            )}
            {nonTechnical.length > 0 && (
              <div className="legend-group">
                <div className="legend-group-title">Non-Technical Roles</div>
                {nonTechnical.map((d) => (
                  <span key={d.label}><i className="dot" style={{ background: d.color }}></i> {d.label} ({d.count})</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <h2>Joined in Last 3 Months</h2>
      {joined.length === 0 ? (
        <p className="muted">No employees joined in the last 3 months.</p>
      ) : (
        <div className="grid movement-cards">
          {joined.map((m) => {
            const emp = empById[m.employee_name] || employees.find((e) => `${e.first_name} ${e.last_name}` === m.employee_name)
            return emp ? (
              <Link key={m.id} to={`/employees/${emp.id}`} className="card movement-card joined-card">
                <div className="muted employee-code">{emp.employee_code}</div>
                <div className="movement-card-head">
                  <div>
                    <div className="employee-name">{m.employee_name}</div>
                    <div className="muted">{m.designation || '—'}</div>
                  </div>
                </div>
                <div className="movement-card-date">
                  <span className="muted">Joined</span>
                  <b>{m.event_date}</b>
                </div>
              </Link>
            ) : (
              <div key={m.id} className="card movement-card joined-card">
                <div className="muted employee-code">—</div>
                <div className="movement-card-head">
                  <div>
                    <div className="employee-name">{m.employee_name}</div>
                    <div className="muted">{m.designation || '—'}</div>
                  </div>
                </div>
                <div className="movement-card-date">
                  <span className="muted">Joined</span>
                  <b>{m.event_date}</b>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <h2>Removed in Last 3 Months</h2>
      {removed.length === 0 ? (
        <p className="muted">No employees removed in the last 3 months.</p>
      ) : (
        <div className="grid movement-cards">
          {removed.map((m) => {
            const emp = empById[m.employee_name] || employees.find((e) => `${e.first_name} ${e.last_name}` === m.employee_name)
            return (
              <div key={m.id} className="card movement-card removed-card">
                <div className="muted employee-code">{emp ? emp.employee_code : '—'}</div>
                <div className="movement-card-head">
                  <div>
                    <div className="employee-name">{m.employee_name}</div>
                    <div className="muted">{m.designation || '—'}</div>
                  </div>
                </div>
                <div className="movement-card-date">
                  <span className="muted">Resigned</span>
                  <b>{m.event_date}</b>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
