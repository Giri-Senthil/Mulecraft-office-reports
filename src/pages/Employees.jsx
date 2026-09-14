import { useState } from 'react'
import { Link } from 'react-router-dom'
import { employees, monthlyEmployeeMovement } from '../data/mock.js'

const emptyForm = {
  employee_code: '',
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  department: '',
  designation: '',
  status: 'active',
  date_of_joining: '',
}

export default function Employees() {
  const [rows, setRows] = useState(employees)
  const [form, setForm] = useState(emptyForm)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [filterField, setFilterField] = useState('designation')
  const [filterValue, setFilterValue] = useState('')

  const departments = [...new Set(rows.map((r) => r.department).filter(Boolean))]
  const designations = [...new Set(rows.map((r) => r.designation).filter(Boolean))]
  const joinedYears = [...new Set(rows.map((r) => r.date_of_joining && r.date_of_joining.slice(0, 4)).filter(Boolean))]

  const filterOptions = {
    department: departments,
    designation: designations,
    joined_year: joinedYears,
  }

  const filteredRows = filterValue
    ? rows.filter((r) => {
        if (filterField === 'joined_year') return r.date_of_joining && r.date_of_joining.slice(0, 4) === filterValue
        return r[filterField] === filterValue
      })
    : rows

  const months = [...new Set(monthlyEmployeeMovement.map((m) => m.event_date.slice(0, 7)))]
    .sort()
    .map((ym) => {
      const [y, mo] = ym.split('-')
      return { key: ym, label: new Date(y, mo - 1, 1).toLocaleString('en', { month: 'short' }) }
    })

  const chartData = months.map((m) => ({
    ...m,
    joined: monthlyEmployeeMovement.filter((x) => x.event_type === 'joined' && x.event_date.slice(0, 7) === m.key).length,
    removed: monthlyEmployeeMovement.filter((x) => x.event_type === 'removed' && x.event_date.slice(0, 7) === m.key).length,
  }))

  const maxVal = Math.max(1, ...chartData.map((d) => Math.max(d.joined, d.removed)))

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (editingId) {
      setRows(rows.map((r) => (r.id === editingId ? { ...r, ...form } : r)))
    } else {
      setRows([{ ...form, id: `e${Date.now()}` }, ...rows])
    }
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(false)
  }

  return (
    <div>
      <div className="page-head">
        <h1>Employees</h1>
        <div className="page-head-actions">
          <div className="filter-row">
            <label>Filter by</label>
            <select value={filterField} onChange={(e) => { setFilterField(e.target.value); setFilterValue('') }}>
              <option value="department">Department</option>
              <option value="designation">Designation</option>
              <option value="joined_year">Joined Year</option>
            </select>
            <select value={filterValue} onChange={(e) => setFilterValue(e.target.value)}>
              <option value="">All</option>
              {(filterOptions[filterField] || []).map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
          <button className="primary" onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(emptyForm) }}>
            {showForm ? 'Cancel' : 'Add Employee'}
          </button>
        </div>
      </div>

      <div className="employee-layout">
        <div className="employee-list">
          {filteredRows.length === 0 && <p className="muted">No employees found.</p>}

          <div className="grid employee-cards">
            {filteredRows.map((r) => (
              <Link key={r.id} to={`/employees/${r.id}`} className="card employee-card">
                <div className="muted employee-code">{r.employee_code}</div>
                <div className="employee-card-head">
                  <div>
                    <div className="employee-name">{r.first_name} {r.last_name}</div>
                    <div className="muted">{r.designation || '—'}</div>
                  </div>
                  <span className={`badge ${r.status}`}>{r.status}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="card chart-card">
          <h2 className="chart-title">Monthly Joined vs Left Employees</h2>
          <div className="chart">
            {chartData.map((d) => (
              <div key={d.key} className="chart-group">
                <div className="bars">
                  <div className="bar-col">
                    <div className="bar joined" style={{ height: `${(d.joined / maxVal) * 100}%` }} title={`${d.joined} joined`}></div>
                    <span className="bar-label">{d.joined}</span>
                  </div>
                  <div className="bar-col">
                    <div className="bar removed" style={{ height: `${(d.removed / maxVal) * 100}%` }} title={`${d.removed} removed`}></div>
                    <span className="bar-label">{d.removed}</span>
                  </div>
                </div>
                <div className="chart-month">{d.label}</div>
              </div>
            ))}
          </div>
          <div className="chart-legend">
            <span><i className="dot joined"></i> Joined</span>
            <span><i className="dot removed"></i> Left</span>
          </div>
        </div>
      </div>

      {showForm && (
        <form className="card form-grid" onSubmit={handleSubmit}>
          <input name="employee_code" placeholder="Employee Code *" value={form.employee_code} onChange={handleChange} required />
          <input name="first_name" placeholder="First Name *" value={form.first_name} onChange={handleChange} required />
          <input name="last_name" placeholder="Last Name *" value={form.last_name} onChange={handleChange} required />
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} />
          <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
          <input name="department" placeholder="Department" value={form.department} onChange={handleChange} />
          <input name="designation" placeholder="Designation" value={form.designation} onChange={handleChange} />
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <input name="date_of_joining" type="date" placeholder="Date of Joining" value={form.date_of_joining} onChange={handleChange} />
          <button className="primary" type="submit">{editingId ? 'Save Changes' : 'Add Employee'}</button>
        </form>
      )}
    </div>
  )
}
