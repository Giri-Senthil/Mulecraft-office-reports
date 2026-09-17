import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'

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
  gender: '',
  date_of_birth: '',
  father_name: '',
  present_address: '',
  permanent_address: '',
  shift_number: '',
  start_of_work: '10:00',
  rest_interval: '1 hour',
  work_ends: '19:00',
  class_of_work: '',
}

export default function Employees() {
  const [rows, setRows] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [filterField, setFilterField] = useState('designation')
  const [filterValue, setFilterValue] = useState('')
  const [movement, setMovement] = useState([])

  useEffect(() => {
    ;(async () => {
      const [empRes, movRes] = await Promise.all([
        supabase.from('employees').select('*').order('employee_code'),
        supabase.from('monthly_employee_movement').select('*'),
      ])
      if (empRes.error) console.error(empRes.error)
      else setRows(empRes.data)
      if (movRes.error) console.error(movRes.error)
      else setMovement(movRes.data)
    })()
  }, [])

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

  const months = [...new Set(movement.map((m) => m.event_date.slice(0, 7)))]
    .sort()
    .map((ym) => {
      const [y, mo] = ym.split('-')
      return { key: ym, label: new Date(y, mo - 1, 1).toLocaleString('en', { month: 'short' }) }
    })

  const chartData = months.map((m) => ({
    ...m,
    joined: movement.filter((x) => x.event_type === 'joined' && x.event_date.slice(0, 7) === m.key).length,
    removed: movement.filter((x) => x.event_type === 'removed' && x.event_date.slice(0, 7) === m.key).length,
  }))

  const maxVal = Math.max(1, ...chartData.map((d) => Math.max(d.joined, d.removed)))

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (editingId) {
      const { error } = await supabase.from('employees').update(form).eq('id', editingId)
      if (error) console.error(error)
      else setRows(rows.map((r) => (r.id === editingId ? { ...r, ...form } : r)))
    } else {
      const { data, error } = await supabase.from('employees').insert([form]).select()
      if (error) console.error(error)
      else setRows([...data, ...rows])
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
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => { setShowForm(false); setEditingId(null) }}>
          <div className="modal add-employee-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingId ? 'Edit Employee' : 'Add Employee'}</h2>
            <div className="add-employee-forms">
          <form className="card form-grid add-form" onSubmit={handleSubmit}>
            <h2>Employee Details</h2>
            <label>Employee Code *<input name="employee_code" placeholder="Employee Code" value={form.employee_code} onChange={handleChange} required /></label>
            <label>First Name *<input name="first_name" placeholder="First Name" value={form.first_name} onChange={handleChange} required /></label>
            <label>Last Name *<input name="last_name" placeholder="Last Name" value={form.last_name} onChange={handleChange} required /></label>
            <label>Email<input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} /></label>
            <label>Phone<input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} /></label>
            <label>Department<input name="department" placeholder="Department" value={form.department} onChange={handleChange} /></label>
            <label>Designation<input name="designation" placeholder="Designation" value={form.designation} onChange={handleChange} /></label>
            <label>Status
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
            <label>Date of Joining<input name="date_of_joining" type="date" placeholder="Date of Joining" value={form.date_of_joining} onChange={handleChange} /></label>
            <label>Gender
              <select name="gender" value={form.gender} onChange={handleChange}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </label>
            <label>Date of Birth<input name="date_of_birth" type="date" placeholder="Date of Birth" value={form.date_of_birth} onChange={handleChange} /></label>
            <label>Father Name<input name="father_name" placeholder="Father Name" value={form.father_name} onChange={handleChange} /></label>
            <label>Present Address<input name="present_address" placeholder="Present Address" value={form.present_address} onChange={handleChange} /></label>
            <label>Permanent Address<input name="permanent_address" placeholder="Permanent Address" value={form.permanent_address} onChange={handleChange} /></label>
            <label>Shift Number<input name="shift_number" placeholder="Shift Number" value={form.shift_number} onChange={handleChange} /></label>
            <label>Class of Work<input name="class_of_work" placeholder="Class of Work" value={form.class_of_work} onChange={handleChange} /></label>
            <button id="add-employee-submit" className="primary" type="submit">{editingId ? 'Save Changes' : 'Add Employee'}</button>
          </form>
        </div>
            <div className="modal-actions">
              <button className="link" type="button" onClick={() => { setShowForm(false); setEditingId(null) }}>Cancel</button>
              <button className="primary" type="button" onClick={() => document.getElementById('add-employee-submit')?.click()}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
