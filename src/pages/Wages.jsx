import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

const emptyForm = { employee_id: '', effective_from: '', basic_pay: '', hra: '', allowances: '', deductions: '', gross_pay: '', net_pay: '', pay_frequency: 'monthly' }

export default function Wages() {
  const [rows, setRows] = useState([])
  const [employees, setEmployees] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    ;(async () => {
      const [wageRes, empRes] = await Promise.all([
        supabase.from('wages').select('*'),
        supabase.from('employees').select('*'),
      ])
      if (wageRes.error) console.error(wageRes.error)
      else setRows(wageRes.data)
      if (empRes.error) console.error(empRes.error)
      else setEmployees(empRes.data)
    })()
  }, [])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (editingId) {
      const { error } = await supabase.from('wages').update(form).eq('id', editingId)
      if (error) console.error(error)
      else setRows(rows.map((r) => (r.id === editingId ? { ...r, ...form } : r)))
    } else {
      const { data, error } = await supabase.from('wages').insert([form]).select()
      if (error) console.error(error)
      else setRows([...data, ...rows])
    }
    setForm(emptyForm)
    setEditingId(null)
  }

  function startEdit(row) {
    setEditingId(row.id)
    setForm({
      employee_id: row.employee_id,
      effective_from: row.effective_from || '',
      basic_pay: row.basic_pay ?? '',
      hra: row.hra ?? '',
      allowances: row.allowances ?? '',
      deductions: row.deductions ?? '',
      gross_pay: row.gross_pay ?? '',
      net_pay: row.net_pay ?? '',
      pay_frequency: row.pay_frequency || 'monthly',
    })
  }

  async function handleDelete(id) {
    if (!confirm('Delete this wage record?')) return
    const { error } = await supabase.from('wages').delete().eq('id', id)
    if (error) console.error(error)
    else setRows(rows.filter((r) => r.id !== id))
  }

  function empName(id) {
    const e = employees.find((x) => x.id === id)
    return e ? `${e.first_name} ${e.last_name}` : '—'
  }

  return (
    <div>
      <h1>Wages</h1>

      <form className="card form-grid" onSubmit={handleSubmit}>
        <select name="employee_id" value={form.employee_id} onChange={handleChange} required>
          <option value="">Select Employee *</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>
          ))}
        </select>
        <input name="effective_from" type="date" placeholder="Effective From" value={form.effective_from} onChange={handleChange} required />
        <input name="basic_pay" type="number" step="0.01" min="0" placeholder="Basic Pay" value={form.basic_pay} onChange={handleChange} />
        <input name="hra" type="number" step="0.01" min="0" placeholder="HRA" value={form.hra} onChange={handleChange} />
        <input name="allowances" type="number" step="0.01" min="0" placeholder="Allowances" value={form.allowances} onChange={handleChange} />
        <input name="deductions" type="number" step="0.01" min="0" placeholder="Deductions" value={form.deductions} onChange={handleChange} />
        <input name="gross_pay" type="number" step="0.01" min="0" placeholder="Gross Pay" value={form.gross_pay} onChange={handleChange} />
        <input name="net_pay" type="number" step="0.01" min="0" placeholder="Net Pay" value={form.net_pay} onChange={handleChange} />
        <select name="pay_frequency" value={form.pay_frequency} onChange={handleChange}>
          <option value="monthly">Monthly</option>
          <option value="weekly">Weekly</option>
          <option value="biweekly">Bi-weekly</option>
        </select>
        <button className="primary" type="submit">{editingId ? 'Save Changes' : 'Add Wage'}</button>
      </form>

      <div className="card">
        <table>
          <thead>
            <tr><th>Employee</th><th>Effective</th><th>Basic</th><th>HRA</th><th>Allow.</th><th>Ded.</th><th>Gross</th><th>Net</th><th>Freq</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={10} className="muted">No wage records.</td></tr>}
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{empName(r.employee_id)}</td>
                <td>{r.effective_from || '—'}</td>
                <td>{r.basic_pay ?? '—'}</td>
                <td>{r.hra ?? '—'}</td>
                <td>{r.allowances ?? '—'}</td>
                <td>{r.deductions ?? '—'}</td>
                <td>{r.gross_pay ?? '—'}</td>
                <td>{r.net_pay ?? '—'}</td>
                <td>{r.pay_frequency}</td>
                <td className="actions">
                  <button className="link" onClick={() => startEdit(r)}>Edit</button>
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
