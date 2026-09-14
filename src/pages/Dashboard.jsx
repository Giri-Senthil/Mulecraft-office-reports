import { employees, leaves, attendance } from '../data/mock.js'

export default function Dashboard() {
  const today = new Date().toISOString().slice(0, 10)
  const active = employees.filter((e) => e.status === 'active')
  const pendingLeaves = leaves.filter((l) => l.status === 'pending')
  const absentToday = attendance.filter((a) => a.date === today && a.status === 'absent')

  const cards = [
    { label: 'Total Employees', value: employees.length },
    { label: 'Active', value: active.length },
    { label: 'Pending Leave Requests', value: pendingLeaves.length },
    { label: 'Absent Today', value: absentToday.length },
  ]

  const recent = [...employees].sort((a, b) => new Date(b.date_of_joining) - new Date(a.date_of_joining)).slice(0, 5)

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="grid cards">
        {cards.map((c) => (
          <div key={c.label} className="card stat-card">
            <div className="stat-value">{c.value}</div>
            <div className="muted">{c.label}</div>
          </div>
        ))}
      </div>
      <h2>Recently Added Employees</h2>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Department</th>
              <th>Designation</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {recent.length === 0 && (
              <tr>
                <td colSpan={4} className="muted">
                  No employees yet. Add one from the Employees page.
                </td>
              </tr>
            )}
            {recent.map((e) => (
              <tr key={e.id}>
                <td>{e.first_name} {e.last_name}</td>
                <td>{e.department || '—'}</td>
                <td>{e.designation || '—'}</td>
                <td>{e.date_of_joining || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
