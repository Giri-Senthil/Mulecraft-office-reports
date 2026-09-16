import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

export default function Reports() {
  const [rows, setRows] = useState([])
  const [employees, setEmployees] = useState([])
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    ;(async () => {
      const [repRes, empRes] = await Promise.all([
        supabase.from('monthly_reports').select('*'),
        supabase.from('employees').select('*'),
      ])
      if (repRes.error) console.error(repRes.error)
      else setRows(repRes.data)
      if (empRes.error) console.error(empRes.error)
      else setEmployees(empRes.data)
    })()
  }, [])

  function empName(id) {
    const e = employees.find((x) => x.id === id)
    return e ? `${e.first_name} ${e.last_name} (${e.employee_code})` : '—'
  }

  const filteredRows = month ? rows.filter((r) => r.month === `${month}-01`) : rows

  async function generateReport() {
    if (!month) return
    setGenerating(true)
    const firstDay = `${month}-01`
    const lastDay = new Date(new Date(firstDay + 'T00:00:00').getFullYear(), new Date(firstDay + 'T00:00:00').getMonth() + 1, 0).toISOString().slice(0, 10)
    const yearStart = `${month.slice(0, 4)}-01-01`

    const [attRes, wageRes, leaveRes] = await Promise.all([
      supabase.from('attendance').select('*').gte('date', yearStart).lte('date', lastDay),
      supabase.from('wages').select('*'),
      supabase.from('leaves').select('*'),
    ])
    if (attRes.error) { console.error(attRes.error); setGenerating(false); return }
    if (wageRes.error) { console.error(wageRes.error); setGenerating(false); return }
    if (leaveRes.error) { console.error(leaveRes.error); setGenerating(false); return }

    const activeEmployees = employees.filter((e) => e.status === 'active')
    const reports = activeEmployees.map((emp) => {
      const att = attRes.data.filter((a) => a.employee_id === emp.id)
      const monthAtt = att.filter((a) => a.date >= firstDay && a.date <= lastDay)
      const days_present = monthAtt.filter((a) => a.status === 'present' || a.status === 'half-day').length
      const days_absent = monthAtt.filter((a) => a.status === 'absent').length
      const days_leave = monthAtt.filter((a) => a.status === 'leave').length
      const total_hours = monthAtt.reduce((sum, a) => sum + (Number(a.hours_worked) || 0), 0)

      const leaveDays = att.filter((a) => a.status === 'absent' && ['casual', 'sick', 'earned'].includes(a.leave_type))
      const cumulative = { casual: 0, sick: 0, earned: 0 }
      let lop = 0
      const [y, m] = month.split('-').map(Number)
      for (let mm = 1; mm <= m; mm++) {
        const monthStart = `${y}-${String(mm).padStart(2, '0')}-01`
        const monthEnd = new Date(y, mm, 0).toISOString().slice(0, 10)
        const monthLeave = leaveDays.filter((a) => a.date >= monthStart && a.date <= monthEnd)
        const before = { casual: cumulative.casual, sick: cumulative.sick, earned: cumulative.earned }
        monthLeave.forEach((a) => { cumulative[a.leave_type] += 1 })
        lop += Math.max(0, cumulative.casual - 12) - Math.max(0, before.casual - 12)
        lop += Math.max(0, cumulative.sick - 12) - Math.max(0, before.sick - 12)
        lop += Math.max(0, cumulative.earned - 12) - Math.max(0, before.earned - 12)
      }

      const wage = wageRes.data.find((w) => w.employee_id === emp.id)
      const gross_pay = wage?.gross_pay ?? null
      const net_pay = wage?.net_pay != null ? Number(wage.net_pay) - lop * 1000 : null
      return { employee_id: emp.id, month: firstDay, days_present, days_absent, days_leave, total_hours, overtime_hours: 0, gross_pay, net_pay, lop }
    })

    const { data, error } = await supabase.from('monthly_reports').upsert(reports, { onConflict: 'employee_id,month' }).select()
    if (error) console.error(error)
    else setRows(data)
    setGenerating(false)
  }

  return (
    <div>
      <div className="page-head">
        <h1>Monthly Reports</h1>
        <div className="report-generate-row">
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
          <button className="primary" onClick={generateReport} disabled={generating}>
            {generating ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr><th>Month</th><th>Employee</th><th>Present</th><th>Absent</th><th>Leave</th><th>Hours</th><th>Gross</th><th>Net</th><th>LOP</th></tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 && <tr><td colSpan={9} className="muted">No reports yet.</td></tr>}
            {filteredRows.map((r) => (
              <tr key={r.id}>
                <td>{r.month}</td>
                <td>{empName(r.employee_id)}</td>
                <td>{r.days_present}</td>
                <td>{r.days_absent}</td>
                <td>{r.days_leave}</td>
                <td>{r.total_hours ?? '—'}</td>
                <td>{r.gross_pay ? `₹${Number(r.gross_pay).toLocaleString()}` : '—'}</td>
                <td>{r.net_pay ? `₹${Number(r.net_pay).toLocaleString()}` : '—'}</td>
                <td>{r.lop ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
