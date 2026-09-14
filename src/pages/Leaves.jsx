import { useState } from 'react'
import { employees, leaves } from '../data/mock.js'

const emptyForm = { employee_id: '', leave_type: 'casual', start_date: '', end_date: '', days: '', reason: '', status: 'approved' }

export default function Leaves() {
  const [rows, setRows] = useState(leaves)
  const [form, setForm] = useState(emptyForm)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    setRows([{ ...form, id: `l${Date.now()}`, applied_on: new Date().toISOString().slice(0, 10), reviewed_by: null, reviewed_on: new Date().toISOString().slice(0, 10) }, ...rows])
    setForm(emptyForm)
  }

  function handleDelete(id) {
    if (!confirm('Delete this leave request?')) return
    setRows(rows.filter((r) => r.id !== id))
  }

  function empName(id) {
    const e = employees.find((x) => x.id === id)
    return e ? `${e.first_name} ${e.last_name}` : '—'
  }

  return (
    <div>
      <h1>Leave Management</h1>

      <form className="card form-grid" onSubmit={handleSubmit}>
        <select name="employee_id" value={form.employee_id} onChange={handleChange} required>
          <option value="">Select Employee *</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>
          ))}
        </select>
        <select name="leave_type" value={form.leave_type} onChange={handleChange}>
          <option value="casual">Casual</option>
          <option value="sick">Sick</option>
          <option value="earned">Earned</option>
          <option value="unpaid">Unpaid</option>
          <option value="other">Other</option>
        </select>
        <input name="start_date" type="date" placeholder="Start Date" value={form.start_date} onChange={handleChange} required />
        <input name="end_date" type="date" placeholder="End Date" value={form.end_date} onChange={handleChange} required />
        <input name="days" type="number" step="0.5" min="0.5" placeholder="Days" value={form.days} onChange={handleChange} />
        <input name="reason" placeholder="Reason" value={form.reason} onChange={handleChange} />
        <button className="primary" type="submit">Submit Leave</button>
      </form>

      <div className="card">
        <table>
          <thead>
            <tr><th>Employee</th><th>Type</th><th>Start</th><th>End</th><th>Days</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={7} className="muted">No leave requests.</td></tr>}
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{empName(r.employee_id)}</td>
                <td>{r.leave_type}</td>
                <td>{r.start_date}</td>
                <td>{r.end_date}</td>
                <td>{r.days ?? '—'}</td>
                <td><span className={`badge ${r.status}`}>{r.status}</span></td>
                <td className="actions">
                  <button className="link danger" onClick={() => handleDelete(r.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
