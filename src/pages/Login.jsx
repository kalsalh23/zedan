import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useApp } from '../store/AppContext'
import { useTitle } from '../lib/hooks'

export default function Login() {
  useTitle('تسجيل الدخول')
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const { toast } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const next = location.state?.next || '/'

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        })
        if (error) throw error
        toast('تم إنشاء الحساب 🎉')
      }
      navigate(next, { replace: true })
    } catch (err) {
      setError(
        err.message?.includes('Invalid login')
          ? 'البريد أو كلمة المرور غير صحيحة'
          : err.message?.includes('already registered')
          ? 'هذا البريد مسجل مسبقًا — سجّل الدخول'
          : err.message || 'حدث خطأ، حاول مجددًا'
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-4xl bg-white p-8 shadow-soft">
        <h1 className="text-center text-2xl font-extrabold text-ink">
          {mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب'}
        </h1>
        <p className="mt-1 text-center text-sm text-silver-500">
          {mode === 'login' ? 'أهلًا بعودتك! سجّل دخولك للمتابعة' : 'أنشئ حسابك خلال ثوانٍ'}
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          {mode === 'signup' && (
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-silver-500">الاسم</span>
              <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="اسمك الكامل" className="w-full rounded-xl border border-silver-200 px-4 py-3 text-sm font-bold outline-none transition focus:border-accent" />
            </label>
          )}
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-silver-500">البريد الإلكتروني</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required dir="ltr" placeholder="you@email.com" className="w-full rounded-xl border border-silver-200 px-4 py-3 text-right text-sm font-bold outline-none transition focus:border-accent" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-silver-500">كلمة المرور</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} dir="ltr" placeholder="••••••••" className="w-full rounded-xl border border-silver-200 px-4 py-3 text-right text-sm font-bold outline-none transition focus:border-accent" />
          </label>

          {error && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-xs font-bold text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-accent py-3.5 text-sm font-bold text-white shadow-glow transition hover:bg-accent-dark active:scale-95 disabled:opacity-60"
          >
            {busy && <Loader2 className="size-4 animate-spin" />}
            {mode === 'login' ? 'دخول' : 'إنشاء الحساب'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-silver-500">
          {mode === 'login' ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}{' '}
          <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }} className="font-bold text-accent">
            {mode === 'login' ? 'أنشئ حسابًا' : 'سجّل الدخول'}
          </button>
        </p>
      </div>
    </div>
  )
}
