import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

const emptyForm = { employee_id: '', leave_type: 'casual', start_date: '', end_date: '', days: '', reason: '', status: 'approved' }

export default function Leaves() {
  const [rows, setRows] = useState([])
  const [employees, setEmployees] = useState([])
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    ;(async () => {
      const [leaveRes, empRes] = await Promise.all([
        supabase.from('leaves').select('*'),
        supabase.from('employees').select('*'),
      ])
      if (leaveRes.error) console.error(leaveRes.error)
      else setRows(leaveRes.data)
      if (empRes.error) console.error(empRes.error)
      else setEmployees(empRes.data)
    })()
  }, [])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const { employee_id, leave_type, start_date, end_date, days, reason } = form
    if (!employee_id || !start_date || !end_date) return

    const workingDays = []
    const start = new Date(start_date + 'T00:00:00')
    const end = new Date(end_date + 'T00:00:00')
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dow = d.getDay()
      if (dow !== 0 && dow !== 6) workingDays.push(d.toISOString().slice(0, 10))
    }
    if (workingDays.length === 0) {
      alert('Selected range has no working days (all weekends).')
      return
    }

    const { data, error } = await supabase.from('leaves').insert([{ ...form, days: workingDays.length, applied_on: new Date().toISOString().slice(0, 10), reviewed_by: null, reviewed_on: new Date().toISOString().slice(0, 10) }]).select()
    if (error) console.error(error)
    else {
      setRows([...data, ...rows])
      const attPayloads = workingDays.map((d) => ({ employee_id, date: d, status: 'absent', check_in: null, check_out: null, leave_type, reason: reason || null, hours_worked: null }))
      const { error: attError } = await supabase.from('attendance').upsert(attPayloads, { onConflict: 'employee_id,date' })
      if (attError) console.error(attError)
    }
    setForm(emptyForm)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this leave request?')) return
    const { error } = await supabase.from('leaves').delete().eq('id', id)
    if (error) console.error(error)
    else setRows(rows.filter((r) => r.id !== id))
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
            <tr><th>Employee</th><th>Type</th><th>Start</th><th>End</th><th>Days</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={6} className="muted">No leave requests.</td></tr>}
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{empName(r.employee_id)}</td>
                <td>{r.leave_type}</td>
                <td>{r.start_date}</td>
                <td>{r.end_date}</td>
                <td>{r.days ?? '—'}</td>
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
