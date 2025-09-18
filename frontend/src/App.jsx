import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Shield, CreditCard, History, LogIn, UserPlus, PieChart } from 'lucide-react'

function getToken() {
  return localStorage.getItem('token')
}

function setToken(token) {
  if (token) localStorage.setItem('token', token)
  else localStorage.removeItem('token')
}

function ProtectedRoute({ children }) {
  const token = getToken()
  if (!token) return <Navigate to="/login" replace />
  return children
}

function Layout({ children }) {
  const navigate = useNavigate()
  const token = getToken()
  return (
    <div>
      <header className="app-header">
        <div className="container header-row">
          <Link to="/" className="brand">
            <span className="logo"><Shield size={20} /></span> PaySecure
          </Link>
          <nav className="nav">
            <Link to="/payments"><CreditCard size={16}/> Payments</Link>
            <Link to="/history"><History size={16}/> History</Link>
            <Link to="/admin"><PieChart size={16}/> Admin</Link>
            {token ? (
              <button onClick={()=>{ setToken(null); navigate('/login') }} className="button primary">Logout</button>
            ) : (
              <div className="row">
                <Link to="/login" className="button ghost"><LogIn size={16}/> Login</Link>
                <Link to="/register" className="button primary"><UserPlus size={16}/> Register</Link>
              </div>
            )}
          </nav>
        </div>
      </header>
      <main className="main">
        <div className="container">
          {children}
        </div>
      </main>
    </div>
  )
}

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  async function onSubmit(e){
    e.preventDefault()
    setError('')
    const res = await fetch('/api/users/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    if (!res.ok) { setError('Invalid credentials'); return }
    const data = await res.json()
    setToken(data.token)
    navigate('/')
  }
  return (
    <div className="card auth-card">
      <h2 className="auth-title">Welcome back</h2>
      <form onSubmit={onSubmit} className="form">
        <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input type="password" className="input" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        {error && <p className="text-muted" style={{color:'#dc2626'}}>{error}</p>}
        <button className="button primary block">Login</button>
      </form>
      <p className="text-muted mt-8">No account? <Link to="/register" className="link">Register</Link></p>
    </div>
  )
}

function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  async function onSubmit(e){
    e.preventDefault()
    setError('')
    const res = await fetch('/api/users/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    })
    if (!res.ok) { setError('Registration failed'); return }
    navigate('/login')
  }
  return (
    <div className="card auth-card">
      <h2 className="auth-title">Create your account</h2>
      <form onSubmit={onSubmit} className="form">
        <input className="input" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
        <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input type="password" className="input" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        {error && <p className="text-muted" style={{color:'#dc2626'}}>{error}</p>}
        <button className="button primary block">Register</button>
      </form>
    </div>
  )
}

function useAuthFetch() {
  return async (url, options={}) => {
    const token = getToken()
    const headers = { 'Content-Type': 'application/json', ...(options.headers||{}), ...(token ? { Authorization: `Bearer ${token}` } : {}) }
    const res = await fetch(url, { ...options, headers })
    if (res.status === 401) {
      setToken(null)
      window.location.href = '/login'
      return Promise.reject(new Error('Unauthorized'))
    }
    return res
  }
}

function Dashboard() {
  const authFetch = useAuthFetch()
  const [profile, setProfile] = useState(null)
  useEffect(()=>{
    authFetch('/api/users/profile').then(r=>r.json()).then(setProfile).catch(()=>{})
  },[])
  return (
    <div className="grid grid-3">
      <div className="card col-span-2">
        <h2 className="card-title">Hello{profile?.user?.name ? `, ${profile.user.name}` : ''}</h2>
        <p className="card-subtle">Manage your payment methods and transactions.</p>
      </div>
      <div className="card">
        <h3 className="card-title mb-16">Quick actions</h3>
        <div className="row">
          <Link to="/payments" className="button ghost">Manage Methods</Link>
          <Link to="/pay" className="button primary">Pay</Link>
        </div>
      </div>
    </div>
  )
}

function Payments() {
  const authFetch = useAuthFetch()
  const [methods, setMethods] = useState([])
  const [type, setType] = useState('card')
  const [details, setDetails] = useState('')
  useEffect(()=>{ authFetch('/api/payments/list').then(r=>r.json()).then(d=>setMethods(d.paymentMethods||[])) },[])
  async function addMethod(e){
    e.preventDefault()
    const res = await authFetch('/api/payments/add',{method:'POST',body:JSON.stringify({type,details})})
    if (res.ok){ const d=await res.json(); setMethods(m=>[...m,d.paymentMethod]); setDetails('') }
  }
  async function remove(id){
    const res = await authFetch(`/api/payments/remove/${id}`,{method:'DELETE'})
    if (res.ok) setMethods(m=>m.filter(x=>x.id!==id))
  }
  return (
    <div className="grid grid-3">
      <div className="card col-span-2">
        <h2 className="card-title">Payment Methods</h2>
        <ul className="list">
          {methods.map(pm=> (
            <li key={pm.id} className="list-item">
              <div>
                <div className="item-title">{pm.type}</div>
                <div className="item-subtle">{pm.details}</div>
              </div>
              <button onClick={()=>remove(pm.id)} className="button danger">Remove</button>
            </li>
          ))}
          {methods.length===0 && <p className="text-muted">No methods yet.</p>}
        </ul>
      </div>
      <div className="card">
        <h3 className="card-title">Add Method</h3>
        <form onSubmit={addMethod} className="form">
          <select value={type} onChange={e=>setType(e.target.value)} className="select">
            <option value="card">Card</option>
            <option value="upi">UPI</option>
          </select>
          <input value={details} onChange={e=>setDetails(e.target.value)} placeholder="Details" className="input" />
          <button className="button primary block">Add</button>
        </form>
      </div>
    </div>
  )
}

function Pay() {
  const authFetch = useAuthFetch()
  const [paymentMethodId, setPaymentMethodId] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [msg, setMsg] = useState('')
  const [methods, setMethods] = useState([])
  useEffect(()=>{ authFetch('/api/payments/list').then(r=>r.json()).then(d=>setMethods(d.paymentMethods||[])) },[])
  async function onSubmit(e){
    e.preventDefault()
    setMsg('')
    const res = await authFetch('/api/payments/pay',{method:'POST',body:JSON.stringify({paymentMethodId:Number(paymentMethodId),amount:Number(amount),description})})
    if (res.ok){ setMsg('Payment successful'); setAmount(''); setDescription(''); setPaymentMethodId('') } else { setMsg('Payment failed') }
  }
  return (
    <div className="card center">
      <h2 className="card-title">Make a Payment</h2>
      <form onSubmit={onSubmit} className="form">
        <select value={paymentMethodId} onChange={e=>setPaymentMethodId(e.target.value)} className="select">
          <option value="">Select method</option>
          {methods.map(m=> <option key={m.id} value={m.id}>{m.type} - {m.details}</option>)}
        </select>
        <input value={amount} onChange={e=>setAmount(e.target.value)} type="number" min="0" step="0.01" placeholder="Amount" className="input" />
        <input value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description" className="input" />
        {msg && <p className="text-muted">{msg}</p>}
        <button className="button primary block">Pay</button>
      </form>
    </div>
  )
}

function HistoryPage(){
  const authFetch = useAuthFetch()
  const [tx, setTx] = useState([])
  useEffect(()=>{ authFetch('/api/payments/history').then(r=>r.json()).then(d=>setTx(d.transactions||[])) },[])
  return (
    <div className="card">
      <h2 className="card-title">Transaction History</h2>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Description</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {tx.map(t => (
              <tr key={t.id}>
                <td>{t.id}</td>
                <td>₹ {t.amount}</td>
                <td style={{textTransform:'capitalize'}}>{t.status}</td>
                <td>{t.description}</td>
                <td>{new Date(t.created_at).toLocaleString()}</td>
              </tr>
            ))}
            {tx.length===0 && (
              <tr><td className="text-muted" colSpan={5}>No transactions yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Admin(){
  const authFetch = useAuthFetch()
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState(null)
  useEffect(()=>{
    authFetch('/api/admin/users').then(r=>r.json()).then(d=>setUsers(d.users||[])).catch(()=>{})
    authFetch('/api/admin/stats').then(r=>r.json()).then(setStats).catch(()=>{})
  },[])
  return (
    <div className="grid grid-3">
      <div className="card col-span-2">
        <h2 className="card-title">Users</h2>
        <ul className="list">
          {users.map(u=> <li key={u.id} className="list-item"><span>{u.name} • {u.email}</span></li>)}
          {users.length===0 && <p className="text-muted">No users or not authorized.</p>}
        </ul>
      </div>
      <div className="card">
        <h2 className="card-title">Stats</h2>
        {stats ? (
          <div className="grid" style={{gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
            <div className="list-item"><div><div className="item-subtle">Total Payments</div><div className="item-title" style={{textTransform:'none'}}>{stats.totalPayments}</div></div></div>
            <div className="list-item"><div><div className="item-subtle">Total Amount</div><div className="item-title" style={{textTransform:'none'}}>₹ {stats.totalAmountProcessed}</div></div></div>
            <div className="list-item"><div><div className="item-subtle">Total Failed</div><div className="item-title" style={{textTransform:'none'}}>{stats.totalFailed}</div></div></div>
            <div className="list-item"><div><div className="item-subtle">Total Users</div><div className="item-title" style={{textTransform:'none'}}>{stats.totalUsers}</div></div></div>
          </div>
        ) : <p className="text-muted">No access or data.</p>}
      </div>
    </div>
  )
}

export default function App(){
  return (
    <Layout>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
        <Route path="/pay" element={<ProtectedRoute><Pay /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  )
}
