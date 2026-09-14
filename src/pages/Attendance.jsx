import { useState } from 'react'
import { employees, attendance } from '../data/mock.js'

const emptyForm = { employee_id: '', date: new Date().toISOString().slice(0, 10), status: 'present', check_in: '', check_out: '', notes: '' }

export default function Attendance() {
  const [rows, setRows] = useState(attendance)
  const [form, setForm] = useState(emptyForm)
  const [addingTo, setAddingTo] = useState(null)
  const [filterDate, setFilterDate] = useState('')
  const [selectedDate, setSelectedDate] = useState('')

  function handleChange(e) {
    const next = { ...form, [e.target.name]: e.target.value }
    if (e.target.name === 'date') {
      const day = new Date(e.target.value + 'T00:00:00').getDay()
      next.status = day === 0 || day === 6 ? 'holiday' : 'present'
    }
    setForm(next)
  }

  function handleSubmit(e) {
    e.preventDefault()
    let next
    const existing = rows.find((r) => r.employee_id === form.employee_id && r.date === form.date)
    if (existing) {
      next = rows.map((r) => (r.id === existing.id ? { ...r, ...form } : r))
    } else {
      next = [{ ...form, id: `a${Date.now()}` }, ...rows]
    }
    setRows(next)
    window.dispatchEvent(new CustomEvent('attendance-updated', { detail: next }))
    setForm({ ...emptyForm, date: form.date })
  }

  function handleDelete(id) {
    if (!confirm('Delete this attendance record?')) return
    const next = rows.filter((r) => r.id !== id)
    setRows(next)
    window.dispatchEvent(new CustomEvent('attendance-updated', { detail: next }))
  }

  function empName(id) {
    const e = employees.find((x) => x.id === id)
    return e ? `${e.first_name} ${e.last_name}` : '—'
  }

  function addToDate(date, status, employeeId) {
    if (!employeeId) return
    let next
    const existing = rows.find((r) => r.employee_id === employeeId && r.date === date)
    if (existing) {
      next = rows.map((r) => (r.id === existing.id ? { ...r, status } : r))
    } else {
      next = [{ id: `a${Date.now()}`, employee_id: employeeId, date, status, check_in: '', check_out: '', notes: '' }, ...rows]
    }
    setRows(next)
    window.dispatchEvent(new CustomEvent('attendance-updated', { detail: next }))
    setAddingTo(null)
  }

  const COLORS = { present: '#16a34a', absent: '#dc2626', 'half-day': '#d97706', holiday: '#4338ca', leave: '#2563eb' }

  function Pie({ records }) {
    const counts = {}
    records.forEach((r) => { counts[r.status] = (counts[r.status] || 0) + 1 })
    const total = records.length
    if (total === 0) return <p className="muted">No data</p>
    let angle = 0
    const segments = Object.entries(counts).map(([status, count]) => {
      const start = angle
      const end = angle + (count / total) * 360
      angle = end
      const large = end - start > 180 ? 1 : 0
      const x1 = 50 + 45 * Math.cos((start * Math.PI) / 180)
      const y1 = 50 + 45 * Math.sin((start * Math.PI) / 180)
      const x2 = 50 + 45 * Math.cos((end * Math.PI) / 180)
      const y2 = 50 + 45 * Math.sin((end * Math.PI) / 180)
      return (
        <path key={status} d={`M50 50 L${x1} ${y1} A45 45 0 ${large} 1 ${x2} ${y2} Z`} fill={COLORS[status] || '#94a3b8'} />
      )
    })
    return (
      <svg viewBox="0 0 100 100" className="pie">
        {segments}
      </svg>
    )
  }

  const grouped = rows.reduce((acc, r) => {
    ;(acc[r.date] = acc[r.date] || []).push(r)
    return acc
  }, {})
  const dates = Object.keys(grouped).sort().reverse().filter((d) => !filterDate || d === filterDate)
  const allActiveDone = employees.filter((e) => e.status === 'active').every((e) => rows.some((r) => r.employee_id === e.id && r.date === form.date))

  return (
    <div>
      <h1>Attendance {allActiveDone && <span className="completed-text">completed</span>}</h1>

      <form className="card form-grid attendance-form" onSubmit={handleSubmit}>
        <select name="employee_id" value={form.employee_id} onChange={handleChange} required>
          <option value="">Select Employee *</option>
          {employees.filter((e) => e.status === 'active' && !rows.some((r) => r.employee_id === e.id && r.date === form.date)).map((e) => (
            <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>
          ))}
        </select>
        <input name="date" type="date" value={form.date} onChange={handleChange} required />
        <select name="status" value={form.status} onChange={handleChange}>
          <option value="present">Present</option>
          <option value="absent">Absent</option>
          <option value="half-day">Half Day</option>
          <option value="holiday">Holiday</option>
          <option value="leave">Leave</option>
        </select>
        <input name="check_in" type="time" placeholder="Check In" value={form.check_in} onChange={handleChange} />
        <input name="check_out" type="time" placeholder="Check Out" value={form.check_out} onChange={handleChange} />
        <input name="notes" placeholder="Notes" value={form.notes} onChange={handleChange} />
        <button className="primary" type="submit">Save Attendance</button>
      </form>

      <div className="filter-row">
        <label>Filter by date</label>
        <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
      </div>

      {dates.length === 0 && <p className="muted">No attendance records.</p>}
      {dates.map((date) => {
        const records = grouped[date]
        const present = records.filter((r) => r.status === 'present')
        const absent = records.filter((r) => r.status === 'absent')
        return (
          <div key={date} className="attendance-row">
            <div className="card attendance-group" onClick={() => setSelectedDate(selectedDate === date ? '' : date)}>
              <h2>{date}</h2>
              <div className="attendance-group-body">
                <div className="attendance-list" onClick={(e) => { e.stopPropagation(); setAddingTo(addingTo === `${date}:present` ? null : `${date}:present`) }}>
                  <h3 className="muted">Present</h3>
                  {present.length === 0 ? <p className="muted">—</p> : present.map((r) => (
                    <p key={r.id}>{empName(r.employee_id)} {addingTo === `${date}:present` && <button className="link danger" onClick={(e) => { e.stopPropagation(); handleDelete(r.id) }}>x</button>}</p>
                  ))}
                  {addingTo === `${date}:present` && (
                    <select autoFocus value="" onChange={(e) => addToDate(date, 'present', e.target.value)}>
                      <option value="">Select employee...</option>
                      {employees.map((e) => (
                        <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="attendance-list" onClick={(e) => { e.stopPropagation(); setAddingTo(addingTo === `${date}:absent` ? null : `${date}:absent`) }}>
                  <h3 className="muted">Absent</h3>
                  {absent.length === 0 ? <p className="muted">—</p> : absent.map((r) => (
                    <p key={r.id} className="attendance-name">
                      {empName(r.employee_id)} {addingTo === `${date}:absent` && <button className="link danger" onClick={(e) => { e.stopPropagation(); handleDelete(r.id) }}>x</button>}
                      <span className="tooltip">{r.notes || 'No reason provided'}</span>
                    </p>
                  ))}
                  {addingTo === `${date}:absent` && (
                    <select autoFocus value="" onChange={(e) => addToDate(date, 'absent', e.target.value)}>
                      <option value="">Select employee...</option>
                      {employees.map((e) => (
                        <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </div>
            {selectedDate === date && (
              <div className="card pie-card">
                <h3 className="muted">Attendance Pie</h3>
                <Pie records={records} />
                <div className="pie-legend">
                  {Object.entries(records.reduce((acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc }, {})).map(([status, count]) => (
                    <span key={status}><i className="dot" style={{ background: COLORS[status] || '#94a3b8' }}></i> {status} ({count})</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
