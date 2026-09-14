import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getEmployee, getByEmployee, employmentDetails, attendance, leaves, employees, wages, statutory } from '../data/mock.js'

export default function EmployeeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [rows, setRows] = useState(employees)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [empRows, setEmpRows] = useState(employmentDetails)
  const [editingEmp, setEditingEmp] = useState(false)
  const [empForm, setEmpForm] = useState({})
  const [editingKey, setEditingKey] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [editingEmpKey, setEditingEmpKey] = useState(null)
  const [editEmpValue, setEditEmpValue] = useState('')
  const [showMoreInfo, setShowMoreInfo] = useState(false)
  const [wageRows, setWageRows] = useState(wages)
  const [statRows, setStatRows] = useState(statutory)
  const [wageForm, setWageForm] = useState({ employee_id: id, effective_from: '', basic_pay: '', hra: '', allowances: '', deductions: '', gross_pay: '', net_pay: '', pay_frequency: 'monthly' })
  const [statForm, setStatForm] = useState({ employee_id: id, pan: '', aadhaar: '', uan: '', pf_number: '', esi_number: '', bank_name: '', bank_account: '', ifsc: '', tax_regime: 'new' })

  const employee = getEmployee(id) || rows.find((r) => r.id === id)

  if (!employee) return <div className="center-screen">Employee not found</div>

  const empEmployment = getByEmployee(empRows, id)
  const empAttendance = getByEmployee(attendance, id).slice(-3)
  const empLeaves = getByEmployee(leaves, id).slice(0, 10)

  const details = [
    { key: 'Employee ID', value: employee.employee_code },
    { key: 'First Name', value: employee.first_name },
    { key: 'Last Name', value: employee.last_name },
    { key: 'Email', value: employee.email },
    { key: 'Phone', value: employee.phone },
    { key: 'Department', value: employee.department },
    { key: 'Designation', value: employee.designation },
    { key: 'Status', value: employee.status },
    { key: 'Date of Joining', value: employee.date_of_joining },
  ]

  const employment = empEmployment[0] || {}
  const employmentDetailsList = [
    { key: 'Employment Type', value: employment.employment_type },
    { key: 'Contract Start', value: employment.contract_start },
    { key: 'Contract End', value: employment.contract_end },
    { key: 'Probation End', value: employment.probation_end },
    { key: 'Work Location', value: employment.work_location },
    { key: 'Manager Name', value: employment.manager_name },
    { key: 'Notes', value: employment.notes },
  ]

  function startEdit() {
    setForm({
      employee_code: employee.employee_code,
      first_name: employee.first_name,
      last_name: employee.last_name,
      email: employee.email || '',
      phone: employee.phone || '',
      department: employee.department || '',
      designation: employee.designation || '',
      status: employee.status,
      date_of_joining: employee.date_of_joining || '',
    })
    setEditing(true)
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    setRows(rows.map((r) => (r.id === employee.id ? { ...r, ...form } : r)))
    setEditing(false)
  }

  function handleRemove() {
    if (!confirm('Delete this employee?')) return
    setRows(rows.filter((r) => r.id !== employee.id))
    navigate('/employees')
  }

  function startEditEmp() {
    setEmpForm({
      employment_type: employment.employment_type || '',
      contract_start: employment.contract_start || '',
      contract_end: employment.contract_end || '',
      probation_end: employment.probation_end || '',
      work_location: employment.work_location || '',
      manager_name: employment.manager_name || '',
      notes: employment.notes || '',
    })
    setEditingEmp(true)
  }

  function handleEmpChange(e) {
    setEmpForm({ ...empForm, [e.target.name]: e.target.value })
  }

  function handleEmpSubmit(e) {
    e.preventDefault()
    if (empEmployment.length > 0) {
      setEmpRows(empRows.map((r) => (r.id === empEmployment[0].id ? { ...r, ...empForm } : r)))
    } else {
      setEmpRows([{ ...empForm, id: `ed${Date.now()}`, employee_id: employee.id }, ...empRows])
    }
    setEditingEmp(false)
  }

  function handleEmpRemove() {
    if (!confirm('Delete employment details?')) return
    setEmpRows(empRows.filter((r) => r.id !== empEmployment[0].id))
    setEditingEmp(false)
  }

  function startEditRow(key) {
    setEditingKey(key)
    setEditValue(employee[key] || '')
  }

  function saveEditRow() {
    setRows(rows.map((r) => (r.id === employee.id ? { ...r, [editingKey]: editValue } : r)))
    setEditingKey(null)
    setEditValue('')
  }

  function startEditEmpRow(key) {
    setEditingEmpKey(key)
    setEditEmpValue(employment[key] || '')
  }

  function saveEditEmpRow() {
    setEmpRows(empRows.map((r) => (r.id === empEmployment[0].id ? { ...r, [editingEmpKey]: editEmpValue } : r)))
    setEditingEmpKey(null)
    setEditEmpValue('')
  }

  return (
    <div className="detail-page">
      <div className="detail-title-row">
        <h1 className="detail-title">{employee.employee_code}</h1>
        <div className="detail-actions">
          <button className="detail-add-info" onClick={() => { setShowMoreInfo(true); setTimeout(() => document.getElementById('more-info-section')?.scrollIntoView({ behavior: 'smooth' }), 100) }}>Add More Info</button>
          <button className="link danger detail-remove" onClick={handleRemove}>Remove Employee</button>
        </div>
      </div>

      {editing ? (
        <form className="card detail-card form-grid" onSubmit={handleSubmit}>
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
          <div className="actions">
            <button className="primary" type="submit">Save Changes</button>
            <button className="link" type="button" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </form>
      ) : (
        <>
          <div className="detail-columns">
            <div className="detail-col">
              <div className="card detail-card">
                <div className="kv-list">
                  {details.map((d) => (
                    <div key={d.key} className="kv-item clickable" onClick={() => startEditRow(d.key === 'Employee ID' ? 'employee_code' : d.key.toLowerCase().replace(/ /g, '_'))}>
                      {editingKey === (d.key === 'Employee ID' ? 'employee_code' : d.key.toLowerCase().replace(/ /g, '_')) ? (
                        <>
                          <input value={editValue} onChange={(e) => setEditValue(e.target.value)} autoFocus />
                          <button className="primary" onClick={(e) => { e.stopPropagation(); saveEditRow() }}>Save</button>
                        </>
                      ) : (
                        <>
                          <span className="muted">{d.key}</span>
                          <b>{d.value || '—'}</b>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <h2>Last 3 Days Attendance</h2>
              <div className="card detail-card">
                {empAttendance.length === 0 ? <p className="muted">No attendance records.</p> : (
                  <div className="kv-list">
                    {empAttendance.map((a) => (
                      <div key={a.id} className="kv-item">
                        <span className="muted">{a.date}</span>
                        <b className={`badge ${a.status}`}>{a.status}</b>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="detail-col">
              <h2>Employment Details</h2>
              <p className="muted employment-desc">
                {employee.first_name} {employee.last_name} is employed as {employment.employment_type || '—'} from {employment.contract_start || '—'} at {employment.work_location || '—'} under {employment.manager_name || '—'}.
              </p>
              {editingEmp ? (
                <form className="card detail-card form-grid" onSubmit={handleEmpSubmit}>
                  <select name="employment_type" value={empForm.employment_type} onChange={handleEmpChange}>
                    <option value="">Select Type</option>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="intern">Intern</option>
                  </select>
                  <input name="contract_start" type="date" placeholder="Contract Start" value={empForm.contract_start} onChange={handleEmpChange} />
                  <input name="contract_end" type="date" placeholder="Contract End" value={empForm.contract_end} onChange={handleEmpChange} />
                  <input name="probation_end" type="date" placeholder="Probation End" value={empForm.probation_end} onChange={handleEmpChange} />
                  <input name="work_location" placeholder="Work Location" value={empForm.work_location} onChange={handleEmpChange} />
                  <input name="manager_name" placeholder="Manager Name" value={empForm.manager_name} onChange={handleEmpChange} />
                  <input name="notes" placeholder="Notes" value={empForm.notes} onChange={handleEmpChange} />
                  <div className="actions">
                    <button className="primary" type="submit">Save Changes</button>
                    <button className="link" type="button" onClick={() => setEditingEmp(false)}>Cancel</button>
                  </div>
                </form>
              ) : (
                <div className="card detail-card">
                  {empEmployment.length === 0 ? <p className="muted">No employment details.</p> : (
                    <div className="kv-list">
                      {employmentDetailsList.map((d) => (
                        <div key={d.key} className="kv-item clickable" onClick={() => startEditEmpRow(d.key.toLowerCase().replace(/ /g, '_'))}>
                          {editingEmpKey === d.key.toLowerCase().replace(/ /g, '_') ? (
                            <>
                              <input value={editEmpValue} onChange={(e) => setEditEmpValue(e.target.value)} autoFocus />
                              <button className="primary" onClick={(e) => { e.stopPropagation(); saveEditEmpRow() }}>Save</button>
                            </>
                          ) : (
                            <>
                              <span className="muted">{d.key}</span>
                              <b>{d.value || '—'}</b>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {showMoreInfo && (
            <div className="more-info" id="more-info-section">
              <h2>Wages</h2>
              <form className="card form-grid" onSubmit={(e) => { e.preventDefault(); setWageRows([{ ...wageForm, id: `w${Date.now()}` }, ...wageRows]); setWageForm({ ...wageForm, effective_from: '', basic_pay: '', hra: '', allowances: '', deductions: '', gross_pay: '', net_pay: '', pay_frequency: 'monthly' }) }}>
                <input name="effective_from" type="date" placeholder="Effective From" value={wageForm.effective_from} onChange={(e) => setWageForm({ ...wageForm, [e.target.name]: e.target.value })} required />
                <input name="basic_pay" type="number" step="0.01" min="0" placeholder="Basic Pay" value={wageForm.basic_pay} onChange={(e) => setWageForm({ ...wageForm, [e.target.name]: e.target.value })} />
                <input name="hra" type="number" step="0.01" min="0" placeholder="HRA" value={wageForm.hra} onChange={(e) => setWageForm({ ...wageForm, [e.target.name]: e.target.value })} />
                <input name="allowances" type="number" step="0.01" min="0" placeholder="Allowances" value={wageForm.allowances} onChange={(e) => setWageForm({ ...wageForm, [e.target.name]: e.target.value })} />
                <input name="deductions" type="number" step="0.01" min="0" placeholder="Deductions" value={wageForm.deductions} onChange={(e) => setWageForm({ ...wageForm, [e.target.name]: e.target.value })} />
                <input name="gross_pay" type="number" step="0.01" min="0" placeholder="Gross Pay" value={wageForm.gross_pay} onChange={(e) => setWageForm({ ...wageForm, [e.target.name]: e.target.value })} />
                <input name="net_pay" type="number" step="0.01" min="0" placeholder="Net Pay" value={wageForm.net_pay} onChange={(e) => setWageForm({ ...wageForm, [e.target.name]: e.target.value })} />
                <select name="pay_frequency" value={wageForm.pay_frequency} onChange={(e) => setWageForm({ ...wageForm, [e.target.name]: e.target.value })}>
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                </select>
                <button className="primary" type="submit">Add Wage</button>
              </form>

              <h2>Statutory & Compliance</h2>
              <form className="card form-grid" onSubmit={(e) => { e.preventDefault(); setStatRows([{ ...statForm, id: `s${Date.now()}` }, ...statRows]); setStatForm({ ...statForm, pan: '', aadhaar: '', uan: '', pf_number: '', esi_number: '', bank_name: '', bank_account: '', ifsc: '', tax_regime: 'new' }) }}>
                <input name="pan" placeholder="PAN" value={statForm.pan} onChange={(e) => setStatForm({ ...statForm, [e.target.name]: e.target.value })} />
                <input name="aadhaar" placeholder="Aadhaar" value={statForm.aadhaar} onChange={(e) => setStatForm({ ...statForm, [e.target.name]: e.target.value })} />
                <input name="uan" placeholder="UAN" value={statForm.uan} onChange={(e) => setStatForm({ ...statForm, [e.target.name]: e.target.value })} />
                <input name="pf_number" placeholder="PF Number" value={statForm.pf_number} onChange={(e) => setStatForm({ ...statForm, [e.target.name]: e.target.value })} />
                <input name="esi_number" placeholder="ESI Number" value={statForm.esi_number} onChange={(e) => setStatForm({ ...statForm, [e.target.name]: e.target.value })} />
                <input name="bank_name" placeholder="Bank Name" value={statForm.bank_name} onChange={(e) => setStatForm({ ...statForm, [e.target.name]: e.target.value })} />
                <input name="bank_account" placeholder="Bank Account" value={statForm.bank_account} onChange={(e) => setStatForm({ ...statForm, [e.target.name]: e.target.value })} />
                <input name="ifsc" placeholder="IFSC" value={statForm.ifsc} onChange={(e) => setStatForm({ ...statForm, [e.target.name]: e.target.value })} />
                <select name="tax_regime" value={statForm.tax_regime} onChange={(e) => setStatForm({ ...statForm, [e.target.name]: e.target.value })}>
                  <option value="new">New Regime</option>
                  <option value="old">Old Regime</option>
                </select>
                <button className="primary" type="submit">Add Record</button>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  )
}
