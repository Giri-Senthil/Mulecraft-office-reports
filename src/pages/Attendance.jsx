import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

const emptyForm = { employee_id: '', date: new Date().toISOString().slice(0, 10), status: 'present', check_in: '', check_out: '', leave_type: '', reason: '' }
const emptyLeaveForm = { employee_id: '', leave_type: 'casual', start_date: '', end_date: '', days: '', reason: '', status: 'approved' }

export default function Attendance() {
  const [rows, setRows] = useState([])
  const [employees, setEmployees] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [addingTo, setAddingTo] = useState(null)
  const [filterDate, setFilterDate] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [leaveForm, setLeaveForm] = useState(emptyLeaveForm)
  const [leaveRows, setLeaveRows] = useState([])
  const [leaveTypeFilter, setLeaveTypeFilter] = useState('')
  const [leaveMonthFilter, setLeaveMonthFilter] = useState(new Date().toISOString().slice(0, 7))
  const [selectedLeaveId, setSelectedLeaveId] = useState(null)
  const [modal, setModal] = useState(null)
  const [modalForm, setModalForm] = useState({ check_in: '', check_out: '', leave_type: '', reason: '' })

  useEffect(() => {
    ;(async () => {
      const [attRes, empRes, leaveRes] = await Promise.all([
        supabase.from('attendance').select('*').order('date', { ascending: false }),
        supabase.from('employees').select('*'),
        supabase.from('leaves').select('*'),
      ])
      if (attRes.error) console.error(attRes.error)
      else setRows(attRes.data)
      if (empRes.error) console.error(empRes.error)
      else setEmployees(empRes.data)
      if (leaveRes.error) console.error(leaveRes.error)
      else setLeaveRows(leaveRes.data)
    })()
  }, [])

  function handleChange(e) {
    const next = { ...form, [e.target.name]: e.target.value }
    if (e.target.name === 'date') {
      const day = new Date(e.target.value + 'T00:00:00').getDay()
      next.status = day === 0 || day === 6 ? 'holiday' : 'present'
    }
    if (e.target.name === 'status' && e.target.value === 'present') {
      if (!next.check_in) next.check_in = '10:00'
      if (!next.check_out) next.check_out = '21:00'
    }
    setForm(next)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const isPresent = form.status === 'present'
    const checkIn = isPresent ? (form.check_in || '10:00') : null
    const checkOut = isPresent ? (form.check_out || '21:00') : null
    const payload = { ...form, check_in: checkIn, check_out: checkOut, hours_worked: isPresent ? calcHours(checkIn, checkOut) : null }
    const existing = rows.find((r) => r.employee_id === form.employee_id && r.date === form.date)
    if (existing) {
      const { error } = await supabase.from('attendance').update(payload).eq('id', existing.id)
      if (error) console.error(error)
      else setRows(rows.map((r) => (r.id === existing.id ? { ...r, ...payload } : r)))
    } else {
      const { data, error } = await supabase.from('attendance').insert([payload]).select()
      if (error) console.error(error)
      else setRows([...data, ...rows])
    }
    setForm({ ...emptyForm, date: form.date })
  }

  async function handleDelete(id) {
    if (!confirm('Delete this attendance record?')) return
    const { error } = await supabase.from('attendance').delete().eq('id', id)
    if (error) console.error(error)
    else setRows(rows.filter((r) => r.id !== id))
  }

  async function handleDeleteDay(date) {
    if (!confirm(`Delete all attendance records for ${date}?`)) return
    const { error } = await supabase.from('attendance').delete().eq('date', date)
    if (error) console.error(error)
    else setRows(rows.filter((r) => r.date !== date))
  }

  function empName(id) {
    const e = employees.find((x) => x.id === id)
    return e ? `${e.first_name} ${e.last_name}` : '—'
  }

  function empCode(id) {
    const e = employees.find((x) => x.id === id)
    return e ? e.employee_code : '—'
  }

  function calcHours(checkIn, checkOut) {
    if (!checkIn || !checkOut) return null
    const [hi, mi] = checkIn.split(':').map(Number)
    const [ho, mo] = checkOut.split(':').map(Number)
    const mins = ho * 60 + mo - (hi * 60 + mi)
    if (mins <= 0) return null
    return (mins / 60).toFixed(2)
  }

  async function addToDate(date, status, employeeId) {
    if (!employeeId) return
    const existing = rows.find((r) => r.employee_id === employeeId && r.date === date)
    if (existing) {
      if (status === 'present' || existing.status === 'present' || status === 'half-day' || (status === 'absent' && existing.status === 'half-day')) {
        setModal({ mode: status === 'present' || status === 'half-day' ? status : 'absent', date, employeeId, existingId: existing.id })
        setModalForm({ check_in: existing.check_in || '10:00', check_out: existing.check_out || '21:00', leave_type: existing.leave_type || '' })
        return
      }
      const { error } = await supabase.from('attendance').delete().eq('id', existing.id)
      if (error) console.error(error)
      else {
        const { data, error: insError } = await supabase.from('attendance').insert([{ employee_id: employeeId, date, status, check_in: null, check_out: null, leave_type: '' }]).select()
        if (insError) console.error(insError)
        else setRows([...data, ...rows.filter((r) => r.id !== existing.id)])
      }
    } else {
      if (status === 'present' || status === 'half-day' || status === 'absent') {
        setModal({ mode: status, date, employeeId, existingId: null })
        setModalForm({ check_in: '10:00', check_out: '21:00', leave_type: '', reason: '' })
        return
      }
      const { data, error } = await supabase.from('attendance').insert([{ employee_id: employeeId, date, status, check_in: null, check_out: null, leave_type: '' }]).select()
      if (error) console.error(error)
      else setRows([...data, ...rows])
    }
    setAddingTo(null)
  }

  async function handleModalSubmit(e) {
    e.preventDefault()
    if (!modal) return
    const { mode, date, employeeId, existingId } = modal
    if (mode === 'present' || mode === 'half-day') {
      const payload = { employee_id: employeeId, date, status: mode, check_in: modalForm.check_in || null, check_out: modalForm.check_out || null, leave_type: '', hours_worked: calcHours(modalForm.check_in, modalForm.check_out) }
      if (existingId) {
        const { data, error } = await supabase.from('attendance').update(payload).eq('id', existingId).select()
        if (error) console.error(error)
        else setRows(rows.map((r) => (r.id === existingId ? { ...r, ...data[0] } : r)))
      } else {
        const { data, error } = await supabase.from('attendance').insert([payload]).select()
        if (error) console.error(error)
        else setRows([...data, ...rows])
      }
    } else {
      const payload = { employee_id: employeeId, date, status: 'absent', check_in: null, check_out: null, leave_type: modalForm.leave_type, reason: modalForm.reason || null, hours_worked: null }
      if (existingId) {
        const { error: delError } = await supabase.from('attendance').delete().eq('id', existingId)
        if (delError) console.error(delError)
        else {
          const { data, error } = await supabase.from('attendance').insert([payload]).select()
          if (error) console.error(error)
          else setRows([...data, ...rows.filter((r) => r.id !== existingId)])
        }
      } else {
        const { data, error } = await supabase.from('attendance').insert([payload]).select()
        if (error) console.error(error)
        else setRows([...data, ...rows])
      }
    }
    setModal(null)
    setAddingTo(null)
  }

  function handleLeaveChange(e) {
    const next = { ...leaveForm, [e.target.name]: e.target.value }
    if ((e.target.name === 'start_date' || e.target.name === 'end_date') && next.start_date && next.end_date) {
      const start = new Date(next.start_date + 'T00:00:00')
      const end = new Date(next.end_date + 'T00:00:00')
      let count = 0
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dow = d.getDay()
        if (dow !== 0 && dow !== 6) count++
      }
      next.days = count
    }
    setLeaveForm(next)
  }

  async function handleLeaveSubmit(e) {
    e.preventDefault()
    const { employee_id, leave_type, start_date, end_date, days, reason } = leaveForm
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

    const year = start_date.slice(0, 4)
    const used = leaveRows
      .filter((r) => r.employee_id === employee_id && r.leave_type === leave_type && r.start_date?.slice(0, 4) === year)
      .reduce((sum, r) => sum + (Number(r.days) || 0), 0)
    if (used + workingDays.length > 12) {
      alert(`Note: ${used + workingDays.length - 12} day(s) of this leave will be counted as LOP (₹1000/day deduction).`)
    }

    const { data, error } = await supabase.from('leaves').insert([{ ...leaveForm, days: workingDays.length, applied_on: new Date().toISOString().slice(0, 10), reviewed_by: null, reviewed_on: new Date().toISOString().slice(0, 10) }]).select()
    if (error) console.error(error)
    else {
      setLeaveRows([...data, ...leaveRows])
      const attPayloads = workingDays.map((d) => ({ employee_id, date: d, status: 'absent', check_in: null, check_out: null, leave_type, reason: reason || null, hours_worked: null }))
      const { data: attData, error: attError } = await supabase.from('attendance').upsert(attPayloads, { onConflict: 'employee_id,date' }).select()
      if (attError) console.error(attError)
      else {
        const existingIds = rows.filter((r) => r.employee_id === employee_id && workingDays.includes(r.date)).map((r) => r.id)
        setRows([...attData, ...rows.filter((r) => !existingIds.includes(r.id))])
      }
    }
    setLeaveForm(emptyLeaveForm)
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
  const today = new Date()
  const day = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((day + 6) % 7))
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d.toISOString().slice(0, 10)
  })
  const dates = Object.keys(grouped).sort().reverse().filter((d) => (filterDate ? d === filterDate : true))
  const allActiveDone = employees.filter((e) => e.status === 'active').every((e) => rows.some((r) => r.employee_id === e.id && r.date === form.date))
  const currentMonth = new Date().toISOString().slice(0, 7)
  const monthLeaves = leaveMonthFilter
    ? leaveRows.filter((r) => r.start_date?.slice(0, 7) === leaveMonthFilter || r.end_date?.slice(0, 7) === leaveMonthFilter)
    : leaveRows
  const filteredLeaves = leaveTypeFilter ? monthLeaves.filter((r) => r.leave_type === leaveTypeFilter) : monthLeaves

  return (
    <div>
      <h1>Attendance {allActiveDone && <span className="completed-text">completed</span>}</h1>

      <div className="attendance-form-row">
        <form className="card attendance-form" onSubmit={handleSubmit}>
          <h2>Attendance</h2>
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
          </select>
          {form.status === 'absent' ? (
            <>
              <select className="fade-in" name="leave_type" value={form.leave_type} onChange={handleChange}>
                <option value="">Select Leave Type</option>
                <option value="casual">Casual</option>
                <option value="sick">Sick</option>
                <option value="earned">Earned</option>
                <option value="unpaid">Unpaid</option>
                <option value="maternity">Maternity</option>
                <option value="paternity">Paternity</option>
              </select>
              <input className="fade-in" name="reason" placeholder="Reason" value={form.reason} onChange={handleChange} />
            </>
          ) : (
            <>
              <input className="fade-in" name="check_in" type="time" placeholder="Check In" value={form.check_in} onChange={handleChange} />
              <input className="fade-in" name="check_out" type="time" placeholder="Check Out" value={form.check_out} onChange={handleChange} />
            </>
          )}
          <button className="primary" type="submit">Save Attendance</button>
        </form>

        <form className="card leave-form" onSubmit={handleLeaveSubmit}>
          <h2>Leave Management</h2>
          <select name="employee_id" value={leaveForm.employee_id} onChange={handleLeaveChange} required>
            <option value="">Select Employee *</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>
            ))}
          </select>
          <select name="leave_type" value={leaveForm.leave_type} onChange={handleLeaveChange}>
            <option value="casual">Casual</option>
            <option value="sick">Sick</option>
            <option value="earned">Earned</option>
            <option value="unpaid">Unpaid</option>
          </select>
          <input name="start_date" type="date" placeholder="Start Date" value={leaveForm.start_date} onChange={handleLeaveChange} required />
          <input name="end_date" type="date" placeholder="End Date" value={leaveForm.end_date} onChange={handleLeaveChange} required />
          <input name="days" type="number" step="0.5" min="0.5" placeholder="Days" value={leaveForm.days} onChange={handleLeaveChange} />
          <input name="reason" placeholder="Reason" value={leaveForm.reason} onChange={handleLeaveChange} />
          <button className="primary" type="submit">Submit Leave</button>
        </form>
      </div>

      <div className="attendance-layout">
        <div className="attendance-main">
          <div className="filter-row">
            <label>Filter by date</label>
            <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
            {filterDate && <button className="link" onClick={() => setFilterDate('')}>Clear</button>}
          </div>

          {dates.length === 0 && <p className="muted">No attendance records.</p>}
          {dates.map((date) => {
            const records = grouped[date]
            const present = records.filter((r) => r.status === 'present')
            const absent = records.filter((r) => r.status === 'absent')
            const halfDay = records.filter((r) => r.status === 'half-day')
            return (
              <div key={date} className="attendance-row">
                <div className="card attendance-group" onClick={() => setSelectedDate(selectedDate === date ? '' : date)}>
                  <h2>{date} <button className="link danger" title="Delete all records for this day" onClick={(e) => { e.stopPropagation(); handleDeleteDay(date) }}>🗑</button></h2>
                  <div className="attendance-group-body">
                    <div className="attendance-list" onClick={(e) => { e.stopPropagation(); setAddingTo(addingTo === `${date}:present` ? null : `${date}:present`) }}>
                      <h3 className="muted">Present</h3>
                      {present.length === 0 ? <p className="muted">—</p> : present.map((r) => (
                        <p key={r.id} className="attendance-name" onClick={() => { setModal({ mode: 'absent', date, employeeId: r.employee_id, existingId: r.id }); setModalForm({ check_in: '', check_out: '', leave_type: r.leave_type || '' }) }}>
                          {empName(r.employee_id)} {addingTo === `${date}:present` && <button className="link danger" onClick={(e) => { e.stopPropagation(); handleDelete(r.id) }}>x</button>}
                        </p>
                      ))}
                      {addingTo === `${date}:present` && (
                        <select autoFocus value="" onClick={(e) => e.stopPropagation()} onChange={(e) => addToDate(date, 'present', e.target.value)}>
                          <option value="">Select employee...</option>
                          {employees.filter((e) => !present.some((r) => r.employee_id === e.id)).map((e) => (
                            <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>
                          ))}
                        </select>
                      )}
                    </div>
                    <div className="attendance-list" onClick={(e) => { e.stopPropagation(); setAddingTo(addingTo === `${date}:absent` ? null : `${date}:absent`) }}>
                      <h3 className="muted">Absent</h3>
                      {absent.length === 0 ? <p className="muted">—</p> : absent.map((r) => (
                        <p key={r.id} className="attendance-name" onClick={() => { setModal({ mode: 'absent', date, employeeId: r.employee_id, existingId: r.id }); setModalForm({ check_in: '', check_out: '', leave_type: r.leave_type || '', reason: r.reason || '' }) }}>
                          {empName(r.employee_id)} {addingTo === `${date}:absent` && <button className="link danger" onClick={(e) => { e.stopPropagation(); handleDelete(r.id) }}>x</button>}
                          <span className="tooltip">{r.reason || r.leave_type || 'No reason provided'}</span>
                        </p>
                      ))}
                      {addingTo === `${date}:absent` && (
                        <select autoFocus value="" onClick={(e) => e.stopPropagation()} onChange={(e) => addToDate(date, 'absent', e.target.value)}>
                          <option value="">Select employee...</option>
                          {employees.filter((e) => !absent.some((r) => r.employee_id === e.id)).map((e) => (
                            <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>
                          ))}
                        </select>
                      )}
                    </div>
                    <div className="attendance-list" onClick={(e) => { e.stopPropagation(); setAddingTo(addingTo === `${date}:half-day` ? null : `${date}:half-day`) }}>
                      <h3 className="muted">Half Day</h3>
                      {halfDay.length === 0 ? <p className="muted">—</p> : halfDay.map((r) => (
                        <p key={r.id} className="attendance-name" onClick={() => { setModal({ mode: 'half-day', date, employeeId: r.employee_id, existingId: r.id }); setModalForm({ check_in: r.check_in || '10:00', check_out: r.check_out || '21:00', leave_type: '', reason: '' }) }}>
                          {empName(r.employee_id)} {addingTo === `${date}:half-day` && <button className="link danger" onClick={(e) => { e.stopPropagation(); handleDelete(r.id) }}>x</button>}
                          <span className="tooltip">{r.leave_type || 'No reason provided'}</span>
                        </p>
                      ))}
                      {addingTo === `${date}:half-day` && (
                        <select autoFocus value="" onClick={(e) => e.stopPropagation()} onChange={(e) => addToDate(date, 'half-day', e.target.value)}>
                          <option value="">Select employee...</option>
                          {employees.filter((e) => !halfDay.some((r) => r.employee_id === e.id)).map((e) => (
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

        <div className="attendance-side">
          <div className="filter-row leave-filter-row">
            <label>Filter leaves by month</label>
            <input type="month" className="leave-filter" value={leaveMonthFilter} onChange={(e) => setLeaveMonthFilter(e.target.value)} />
          </div>
          <div className="filter-row leave-filter-row">
            <label>Filter leaves by type</label>
            <select className="leave-filter" value={leaveTypeFilter} onChange={(e) => setLeaveTypeFilter(e.target.value)}>
              <option value="">All types</option>
              <option value="casual">Casual</option>
              <option value="sick">Sick</option>
              <option value="earned">Earned</option>
              <option value="unpaid">Unpaid</option>
              <option value="maternity">Maternity</option>
              <option value="paternity">Paternity</option>
            </select>
          </div>

          <div className="leave-section">
            {filteredLeaves.length === 0 && <p className="muted">No leave requests.</p>}
            <div className="grid leave-cards">
              {filteredLeaves.map((r) => (
                <div key={r.id} className="card leave-card" onClick={() => setSelectedLeaveId(selectedLeaveId === r.id ? null : r.id)}>
                  <div className="leave-card-code">{empCode(r.employee_id)}</div>
                  <div className="leave-card-name">{empName(r.employee_id)}</div>
                  <div className="muted">{r.leave_type}</div>
                  {selectedLeaveId === r.id && (
                    <div className="leave-card-detail">
                      <div className="leave-card-dates">{r.start_date} — {r.end_date}</div>
                      <div className="muted">{r.reason || 'No reason provided'}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => { setModal(null); setAddingTo(null) }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{modal.mode === 'present' ? 'Set Check-In / Check-Out' : modal.mode === 'half-day' ? 'Set Half Day Check-In / Check-Out' : 'Set Leave Type'}</h2>
            <p className="muted">{empName(modal.employeeId)} — {modal.date}</p>
            <form onSubmit={handleModalSubmit}>
              {modal.mode === 'present' || modal.mode === 'half-day' ? (
                <>
                  <label>Check In<input name="check_in" type="time" value={modalForm.check_in} onChange={(e) => setModalForm({ ...modalForm, check_in: e.target.value })} /></label>
                  <label>Check Out<input name="check_out" type="time" value={modalForm.check_out} onChange={(e) => setModalForm({ ...modalForm, check_out: e.target.value })} /></label>
                </>
              ) : (
                <>
                  <label>Leave Type
                    <select name="leave_type" value={modalForm.leave_type} onChange={(e) => setModalForm({ ...modalForm, leave_type: e.target.value })} required>
                      <option value="">Select Leave Type</option>
                      <option value="casual">Casual</option>
                      <option value="sick">Sick</option>
                      <option value="earned">Earned</option>
                      <option value="unpaid">Unpaid</option>
                      <option value="maternity">Maternity</option>
                      <option value="paternity">Paternity</option>
                    </select>
                  </label>
                  <label>Reason<input name="reason" value={modalForm.reason || ''} onChange={(e) => setModalForm({ ...modalForm, reason: e.target.value })} /></label>
                </>
              )}
              <div className="modal-actions">
                <button className="link" type="button" onClick={() => { setModal(null); setAddingTo(null) }}>Cancel</button>
                <button className="primary" type="submit">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
