import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

const emptyForm = { employee_id: '', pan: '', aadhaar: '', uan: '', pf_number: '', esi_number: '', bank_name: '', bank_account: '', ifsc: '', tax_regime: 'new' }

export default function Statutory() {
  const [rows, setRows] = useState([])
  const [employees, setEmployees] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    ;(async () => {
      const [statRes, empRes] = await Promise.all([
        supabase.from('statutory').select('*'),
        supabase.from('employees').select('*'),
      ])
      if (statRes.error) console.error(statRes.error)
      else setRows(statRes.data)
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
      const { error } = await supabase.from('statutory').update(form).eq('id', editingId)
      if (error) console.error(error)
      else setRows(rows.map((r) => (r.id === editingId ? { ...r, ...form } : r)))
    } else {
      const { data, error } = await supabase.from('statutory').insert([form]).select()
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
      pan: row.pan || '',
      aadhaar: row.aadhaar || '',
      uan: row.uan || '',
      pf_number: row.pf_number || '',
      esi_number: row.esi_number || '',
      bank_name: row.bank_name || '',
      bank_account: row.bank_account || '',
      ifsc: row.ifsc || '',
      tax_regime: row.tax_regime || 'new',
    })
  }

  async function handleDelete(id) {
    if (!confirm('Delete this statutory record?')) return
    const { error } = await supabase.from('statutory').delete().eq('id', id)
    if (error) console.error(error)
    else setRows(rows.filter((r) => r.id !== id))
  }

  function empName(id) {
    const e = employees.find((x) => x.id === id)
    return e ? `${e.first_name} ${e.last_name}` : '—'
  }

  return (
    <div>
      <h1>Statutory & Compliance</h1>

      <form className="card form-grid" onSubmit={handleSubmit}>
        <select name="employee_id" value={form.employee_id} onChange={handleChange} required>
          <option value="">Select Employee *</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>
          ))}
        </select>
        <input name="pan" placeholder="PAN" value={form.pan} onChange={handleChange} />
        <input name="aadhaar" placeholder="Aadhaar" value={form.aadhaar} onChange={handleChange} />
        <input name="uan" placeholder="UAN" value={form.uan} onChange={handleChange} />
        <input name="pf_number" placeholder="PF Number" value={form.pf_number} onChange={handleChange} />
        <input name="esi_number" placeholder="ESI Number" value={form.esi_number} onChange={handleChange} />
        <input name="bank_name" placeholder="Bank Name" value={form.bank_name} onChange={handleChange} />
        <input name="bank_account" placeholder="Bank Account" value={form.bank_account} onChange={handleChange} />
        <input name="ifsc" placeholder="IFSC" value={form.ifsc} onChange={handleChange} />
        <select name="tax_regime" value={form.tax_regime} onChange={handleChange}>
          <option value="new">New Regime</option>
          <option value="old">Old Regime</option>
        </select>
        <button className="primary" type="submit">{editingId ? 'Save Changes' : 'Add Record'}</button>
      </form>

      <div className="card">
        <table>
          <thead>
            <tr><th>Employee</th><th>PAN</th><th>Aadhaar</th><th>UAN</th><th>PF</th><th>ESI</th><th>Bank</th><th>IFSC</th><th>Regime</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={10} className="muted">No statutory records.</td></tr>}
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{empName(r.employee_id)}</td>
                <td>{r.pan || '—'}</td>
                <td>{r.aadhaar || '—'}</td>
                <td>{r.uan || '—'}</td>
                <td>{r.pf_number || '—'}</td>
                <td>{r.esi_number || '—'}</td>
                <td>{r.bank_name || '—'} {r.bank_account || ''}</td>
                <td>{r.ifsc || '—'}</td>
                <td>{r.tax_regime || '—'}</td>
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
