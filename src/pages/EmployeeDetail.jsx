import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'

function SectionCard({ title, description, children }) {
  return (
    <div className="card detail-card section-card">
      <h2>{title}</h2>
      {description && <p className="muted employment-desc">{description}</p>}
      {children}
    </div>
  )
}

function DetailCard({ title, description, children }) {
  return (
    <div className="detail-card-pair">
      <div className="card detail-card-details">
        <h2>{title}</h2>
        {children}
      </div>
      <div className="card detail-card-desc">
        <p>{description}</p>
      </div>
    </div>
  )
}

export default function EmployeeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [employee, setEmployee] = useState(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [wageRows, setWageRows] = useState([])
  const [statRows, setStatRows] = useState([])
  const [attendanceRows, setAttendanceRows] = useState([])
  const [leaveRows, setLeaveRows] = useState([])
  const [editingKey, setEditingKey] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [editingWageKey, setEditingWageKey] = useState(null)
  const [editWageValue, setEditWageValue] = useState('')
  const [editingStatKey, setEditingStatKey] = useState(null)
  const [editStatValue, setEditStatValue] = useState('')
  const [wageForm, setWageForm] = useState({ employee_id: id, effective_from: '', basic_pay: '', hra: '', allowances: '', deductions: '', gross_pay: '', net_pay: '', pay_frequency: 'monthly' })
  const [statForm, setStatForm] = useState({ pan: '', aadhaar: '', uan: '', pf_number: '', esi_number: '', bank_name: '', bank_account: '', ifsc: '', tax_regime: 'new' })
  const [removalReason, setRemovalReason] = useState('')
  const [showRemoveModal, setShowRemoveModal] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [infoMessage, setInfoMessage] = useState('')

  useEffect(() => {
    ;(async () => {
      const [empRes, wageRes, attRes, leaveRes] = await Promise.all([
        supabase.from('employees').select('*').eq('id', id).single(),
        supabase.from('wages').select('*').eq('employee_id', id),
        supabase.from('attendance').select('*').eq('employee_id', id).order('date', { ascending: false }).limit(3),
        supabase.from('leaves').select('*').eq('employee_id', id).order('start_date', { ascending: false }).limit(10),
      ])
      if (empRes.error) console.error(empRes.error)
      else setEmployee(empRes.data)
      if (wageRes.error) console.error(wageRes.error)
      else setWageRows(wageRes.data)
      if (attRes.error) console.error(attRes.error)
      else setAttendanceRows(attRes.data)
      if (leaveRes.error) console.error(leaveRes.error)
      else setLeaveRows(leaveRes.data)
    })()
  }, [id])

  useEffect(() => {
    if (!employee) return
    ;(async () => {
      const { data, error } = await supabase.from('statutory').select('*').eq('employee_code', employee.employee_code)
      if (error) console.error(error)
      else setStatRows(data)
    })()
  }, [employee])

  if (!employee) return <div className="center-screen">Employee not found</div>

  const empAttendance = attendanceRows
  const empLeaves = leaveRows
  const empWages = wageRows
  const empStatutory = statRows

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
    { key: 'Gender', value: employee.gender },
    { key: 'Date of Birth', value: employee.date_of_birth },
    { key: 'Father Name', value: employee.father_name },
    { key: 'Present Address', value: employee.present_address },
    { key: 'Permanent Address', value: employee.permanent_address },
    { key: 'Shift Number', value: employee.shift_number },
    { key: 'Start of Work', value: employee.start_of_work },
    { key: 'Rest Interval', value: employee.rest_interval },
    { key: 'Work Ends', value: employee.work_ends },
    { key: 'Class of Work', value: employee.class_of_work },
  ]

  const wage = empWages[0] || {}
  const wageDetailsList = [
    { key: 'Effective From', value: wage.effective_from },
    { key: 'Basic Pay', value: wage.basic_pay },
    { key: 'HRA', value: wage.hra },
    { key: 'Allowances', value: wage.allowances },
    { key: 'Deductions', value: wage.deductions },
    { key: 'Gross Pay', value: wage.gross_pay },
    { key: 'Net Pay', value: wage.net_pay },
    { key: 'Pay Frequency', value: wage.pay_frequency },
  ]

  const stat = empStatutory[0] || {}
  const statutoryDetailsList = [
    { key: 'PAN', value: stat.pan },
    { key: 'Aadhaar', value: stat.aadhaar },
    { key: 'UAN', value: stat.uan },
    { key: 'PF Number', value: stat.pf_number },
    { key: 'ESI Number', value: stat.esi_number },
    { key: 'Bank Name', value: stat.bank_name },
    { key: 'Bank Account', value: stat.bank_account },
    { key: 'IFSC', value: stat.ifsc },
    { key: 'Tax Regime', value: stat.tax_regime },
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

  async function handleSubmit(e) {
    e.preventDefault()
    const { error } = await supabase.from('employees').update(form).eq('id', employee.id)
    if (error) console.error(error)
    else setEmployee({ ...employee, ...form })
    setEditing(false)
  }

  async function handleRemove() {
    if (!removalReason.trim()) return
    const name = `${employee.first_name} ${employee.last_name}`
    await supabase.from('monthly_employee_movement').insert({
      employee_name: name,
      designation: employee.designation || '',
      reason: removalReason.trim(),
      event_type: 'removed',
      event_date: new Date().toISOString().slice(0, 10),
    })
    await supabase.from('employees').delete().eq('id', employee.id)
    setShowRemoveModal(false)
    setRemovalReason('')
    navigate('/employees')
  }

  function startEditRow(key) {
    setEditingKey(key)
    setEditValue(employee[key] || '')
  }

  async function saveEditRow() {
    const { error } = await supabase.from('employees').update({ [editingKey]: editValue }).eq('id', employee.id)
    if (error) console.error(error)
    else setEmployee({ ...employee, [editingKey]: editValue })
    setEditingKey(null)
    setEditValue('')
  }

  function startEditWageRow(key) {
    setEditingWageKey(key)
    setEditWageValue(wage[key] ?? '')
  }

  async function saveEditWageRow() {
    const { error } = await supabase.from('wages').update({ [editingWageKey]: editWageValue }).eq('id', empWages[0].id)
    if (error) console.error(error)
    else setWageRows(wageRows.map((r) => (r.id === empWages[0].id ? { ...r, [editingWageKey]: editWageValue } : r)))
    setEditingWageKey(null)
    setEditWageValue('')
  }

  function startEditStatRow(key) {
    setEditingStatKey(key)
    setEditStatValue(stat[key] ?? '')
  }

  async function saveEditStatRow() {
    const { error } = await supabase.from('statutory').update({ [editingStatKey]: editStatValue }).eq('id', empStatutory[0].id)
    if (error) console.error(error)
    else setStatRows(statRows.map((r) => (r.id === empStatutory[0].id ? { ...r, [editingStatKey]: editStatValue } : r)))
    setEditingStatKey(null)
    setEditStatValue('')
  }

  return (
    <div className="detail-page">
      <div className="detail-title-row">
        <h1 className="detail-title">{employee.employee_code}</h1>
        <div className="detail-actions">
          {empWages.length === 0 || empStatutory.length === 0 ? (
            <button className="primary detail-add-info" onClick={() => setShowInfoModal(true)}>Add More Info</button>
          ) : null}
          <button className="link danger detail-remove" onClick={() => setShowRemoveModal(true)}>Remove Employee</button>
        </div>
      </div>

      {showInfoModal && (
        <div className="modal-overlay" onClick={() => setShowInfoModal(false)}>
          <div className="modal add-employee-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Add More Info</h2>
            <div className="add-employee-forms">
              {wageRows.length === 0 && (
              <form id="wage-form" className="card form-grid add-form" onSubmit={async (e) => { e.preventDefault(); const { data, error } = await supabase.from('wages').insert([{ ...wageForm, employee_id: employee.id, employee_code: employee.employee_code }]).select(); if (error) console.error(error); else { setWageRows(data); setWageForm({ ...wageForm, effective_from: '', basic_pay: '', hra: '', allowances: '', deductions: '', gross_pay: '', net_pay: '', pay_frequency: 'monthly' }); setInfoMessage('Wage details added') } }}>
                <h2>Wages</h2>
                <label>Effective From *<input name="effective_from" type="date" placeholder="Effective From" value={wageForm.effective_from} onChange={(e) => setWageForm({ ...wageForm, [e.target.name]: e.target.value })} required /></label>
                <label>Basic Pay<input name="basic_pay" type="number" step="0.01" min="0" placeholder="Basic Pay" value={wageForm.basic_pay} onChange={(e) => setWageForm({ ...wageForm, [e.target.name]: e.target.value })} /></label>
                <label>HRA<input name="hra" type="number" step="0.01" min="0" placeholder="HRA" value={wageForm.hra} onChange={(e) => setWageForm({ ...wageForm, [e.target.name]: e.target.value })} /></label>
                <label>Allowances<input name="allowances" type="number" step="0.01" min="0" placeholder="Allowances" value={wageForm.allowances} onChange={(e) => setWageForm({ ...wageForm, [e.target.name]: e.target.value })} /></label>
                <label>Deductions<input name="deductions" type="number" step="0.01" min="0" placeholder="Deductions" value={wageForm.deductions} onChange={(e) => setWageForm({ ...wageForm, [e.target.name]: e.target.value })} /></label>
                <label>Gross Pay<input name="gross_pay" type="number" step="0.01" min="0" placeholder="Gross Pay" value={wageForm.gross_pay} onChange={(e) => setWageForm({ ...wageForm, [e.target.name]: e.target.value })} /></label>
                <label>Net Pay<input name="net_pay" type="number" step="0.01" min="0" placeholder="Net Pay" value={wageForm.net_pay} onChange={(e) => setWageForm({ ...wageForm, [e.target.name]: e.target.value })} /></label>
                <label>Pay Frequency
                <select name="pay_frequency" value={wageForm.pay_frequency} onChange={(e) => setWageForm({ ...wageForm, [e.target.name]: e.target.value })}>
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                </select>
                </label>
              </form>
              )}

              {statRows.length === 0 && (
              <form id="stat-form" className="card form-grid add-form" onSubmit={async (e) => { e.preventDefault(); const { data, error } = await supabase.from('statutory').insert([{ ...statForm, employee_code: employee.employee_code }]).select(); if (error) console.error(error); else { setStatRows(data); setStatForm({ ...statForm, pan: '', aadhaar: '', uan: '', pf_number: '', esi_number: '', bank_name: '', bank_account: '', ifsc: '', tax_regime: 'new' }); setInfoMessage('Statutory details added') } }}>
                <h2>Statutory & Compliance</h2>
                <label>PAN<input name="pan" placeholder="PAN" value={statForm.pan} onChange={(e) => setStatForm({ ...statForm, [e.target.name]: e.target.value })} /></label>
                <label>Aadhaar<input name="aadhaar" placeholder="Aadhaar" value={statForm.aadhaar} onChange={(e) => setStatForm({ ...statForm, [e.target.name]: e.target.value })} /></label>
                <label>UAN<input name="uan" placeholder="UAN" value={statForm.uan} onChange={(e) => setStatForm({ ...statForm, [e.target.name]: e.target.value })} /></label>
                <label>PF Number<input name="pf_number" placeholder="PF Number" value={statForm.pf_number} onChange={(e) => setStatForm({ ...statForm, [e.target.name]: e.target.value })} /></label>
                <label>ESI Number<input name="esi_number" placeholder="ESI Number" value={statForm.esi_number} onChange={(e) => setStatForm({ ...statForm, [e.target.name]: e.target.value })} /></label>
                <label>Bank Name<input name="bank_name" placeholder="Bank Name" value={statForm.bank_name} onChange={(e) => setStatForm({ ...statForm, [e.target.name]: e.target.value })} /></label>
                <label>Bank Account<input name="bank_account" placeholder="Bank Account" value={statForm.bank_account} onChange={(e) => setStatForm({ ...statForm, [e.target.name]: e.target.value })} /></label>
                <label>IFSC<input name="ifsc" placeholder="IFSC" value={statForm.ifsc} onChange={(e) => setStatForm({ ...statForm, [e.target.name]: e.target.value })} /></label>
                <label>Tax Regime
                <select name="tax_regime" value={statForm.tax_regime} onChange={(e) => setStatForm({ ...statForm, [e.target.name]: e.target.value })}>
                  <option value="new">New Regime</option>
                  <option value="old">Old Regime</option>
                </select>
                </label>
              </form>
              )}
            </div>
            <div className="modal-actions">
              {infoMessage && <span className="completed-text info-message">{infoMessage}</span>}
              <button className="link" type="button" onClick={() => setShowInfoModal(false)}>Cancel</button>
              <button className="primary" type="button" onClick={() => { document.getElementById('wage-form')?.requestSubmit(); document.getElementById('stat-form')?.requestSubmit(); setTimeout(() => setShowInfoModal(false), 300) }}>Add</button>
            </div>
          </div>
        </div>
      )}

      {showRemoveModal && (
        <div className="modal-overlay" onClick={() => setShowRemoveModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Remove {employee.first_name} {employee.last_name}</h2>
            <p className="muted">Please provide a reason for removing this employee. It will be stored in the monthly employee movement records.</p>
            <textarea
              className="removal-reason"
              placeholder="Reason for removal *"
              value={removalReason}
              onChange={(e) => setRemovalReason(e.target.value)}
              rows={3}
            />
            <div className="modal-actions">
              <button className="link" onClick={() => { setShowRemoveModal(false); setRemovalReason('') }}>Cancel</button>
              <button className="primary danger" disabled={!removalReason.trim()} onClick={handleRemove}>Remove Employee</button>
            </div>
          </div>
        </div>
      )}

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
          <div className="detail-cards-stack">
            <DetailCard title="Employee Details" description={`${employee.first_name} ${employee.last_name} (${employee.employee_code}) is a ${employee.designation || '—'} in the ${employee.department || '—'} department, ${employee.status} since ${employee.date_of_joining || '—'}.`}>
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
            </DetailCard>

            {empStatutory.length > 0 && (
            <DetailCard
              title="Statutory & Compliance"
              description={`${employee.first_name} ${employee.last_name} holds PAN ${stat.pan || '—'} and Aadhaar ${stat.aadhaar || '—'}, with PF ${stat.pf_number || '—'} and ESI ${stat.esi_number || '—'}. Salary is credited to ${stat.bank_name || '—'} account ${stat.bank_account || '—'} (IFSC ${stat.ifsc || '—'}) under the ${stat.tax_regime || '—'} tax regime.`}
            >
              <div className="kv-list">
                {statutoryDetailsList.map((d) => (
                  <div key={d.key} className="kv-item clickable" onClick={() => startEditStatRow(d.key.toLowerCase().replace(/ /g, '_'))}>
                    {editingStatKey === d.key.toLowerCase().replace(/ /g, '_') ? (
                      <>
                        <input value={editStatValue} onChange={(e) => setEditStatValue(e.target.value)} autoFocus />
                        <button className="primary" onClick={(e) => { e.stopPropagation(); saveEditStatRow() }}>Save</button>
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
            </DetailCard>
            )}

            {empWages.length > 0 && (
            <DetailCard
              title="Wages"
              description={`${employee.first_name} ${employee.last_name} earns a gross pay of ${wage.gross_pay ? `₹${wage.gross_pay}` : '—'} with a net pay of ${wage.net_pay ? `₹${wage.net_pay}` : '—'} effective from ${wage.effective_from || '—'} on a ${wage.pay_frequency || '—'} basis.`}
            >
              <div className="kv-list">
                {wageDetailsList.map((d) => (
                  <div key={d.key} className="kv-item clickable" onClick={() => startEditWageRow(d.key.toLowerCase().replace(/ /g, '_'))}>
                    {editingWageKey === d.key.toLowerCase().replace(/ /g, '_') ? (
                      <>
                        <input value={editWageValue} onChange={(e) => setEditWageValue(e.target.value)} autoFocus />
                        <button className="primary" onClick={(e) => { e.stopPropagation(); saveEditWageRow() }}>Save</button>
                      </>
                    ) : (
                      <>
                        <span className="muted">{d.key}</span>
                        <b>{d.value ?? '—'}</b>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </DetailCard>
            )}
          </div>

          <div className="detail-columns attendance-below">
            <div className="detail-col">
              <SectionCard title="Last 3 Days Attendance">
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
              </SectionCard>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
