import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError, login } from '../lib/api'
import { useAuth } from '../lib/AuthContext'
import { useToast } from '../components/Toasts'
import { IconAlertTriangle, IconWrench } from '../components/icons'

export function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; password?: string }>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const auth = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const validate = () => {
    const errors: typeof fieldErrors = {}
    if (username.trim().length < 6 || username.trim().length > 20) {
      errors.username = 'Логин должен содержать от 6 до 20 символов'
    }
    if (password.length < 10 || password.length > 20) {
      errors.password = 'Пароль должен содержать от 10 до 20 символов'
    }
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setServerError(null)
    if (!validate()) return

    setLoading(true)
    try {
      const res = await login(username.trim(), password)
      auth.login(res)
      toast('success', `С возвращением, ${res.username}!`)
      navigate('/requests', { replace: true })
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
          setFieldErrors({
            username: err.fieldErrors['Username'] ?? err.fieldErrors['username'],
            password: err.fieldErrors['Password'] ?? err.fieldErrors['password'],
          })
        }
        setServerError(err.message)
      } else {
        setServerError('Неизвестная ошибка, попробуйте ещё раз')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-screen">
      <div className="login-grid-pattern" />

      <div className="login-card fade-up">
        <div className="login-brand">
          <div className="brand-mark">
            <IconWrench size={21} color="#fff" />
          </div>
          <div className="brand-name">
            Service<span>CRM</span>
          </div>
        </div>

        <h1 className="login-title">Вход в систему</h1>
        <p className="login-sub">Панель управления заявками сервисного центра</p>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {serverError && (
            <div className="login-error" role="alert">
              <IconAlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{serverError}</span>
            </div>
          )}

          <div className="field">
            <label className="label" htmlFor="login-username">
              Логин
            </label>
            <input
              id="login-username"
              className={`input ${fieldErrors.username ? 'invalid' : ''}`}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Введите логин"
              autoComplete="username"
              autoFocus
              disabled={loading}
            />
            {fieldErrors.username && <span className="field-error">{fieldErrors.username}</span>}
          </div>

          <div className="field">
            <label className="label" htmlFor="login-password">
              Пароль
            </label>
            <input
              id="login-password"
              type="password"
              className={`input ${fieldErrors.password ? 'invalid' : ''}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
              autoComplete="current-password"
              disabled={loading}
            />
            {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
            <span className="hint">Логин 6–20 символов · пароль 10–20 символов</span>
          </div>

          <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
            {loading ? (
              <>
                <svg className="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Входим…
              </>
            ) : (
              'Войти'
            )}
          </button>
        </form>

        <div className="login-footer">
          Доступ только для администраторов · сессия живёт 8 часов
        </div>
      </div>
    </div>
  )
}
