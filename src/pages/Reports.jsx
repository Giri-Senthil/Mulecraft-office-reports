import { useState } from 'react'
import { employees, monthlyReports } from '../data/mock.js'

export default function Reports() {
  const [rows, setRows] = useState(monthlyReports)

  function empName(id) {
    const e = employees.find((x) => x.id === id)
    return e ? `${e.first_name} ${e.last_name} (${e.employee_code})` : '—'
  }

  return (
    <div>
      <div className="page-head">
        <h1>Monthly Reports</h1>
        <button className="primary" onClick={() => alert('Report generation will be wired to the backend later.')}>
          Generate This Month
        </button>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr><th>Month</th><th>Employee</th><th>Present</th><th>Absent</th><th>Leave</th><th>Gross</th><th>Net</th></tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={7} className="muted">No reports yet.</td></tr>}
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.month}</td>
                <td>{empName(r.employee_id)}</td>
                <td>{r.days_present}</td>
                <td>{r.days_absent}</td>
                <td>{r.days_leave}</td>
                <td>{r.gross_pay ? `₹${Number(r.gross_pay).toLocaleString()}` : '—'}</td>
                <td>{r.net_pay ? `₹${Number(r.net_pay).toLocaleString()}` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
