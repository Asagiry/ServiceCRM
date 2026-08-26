import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { initials } from '../lib/format'
import {
  IconChartBar,
  IconClipboardList,
  IconLogout,
  IconMegaphone,
  IconUsers,
  IconWrench,
} from './icons'

const NAV_WORK = [
  { to: '/', label: 'Главная', icon: IconChartBar, end: true },
  { to: '/requests', label: 'Заявки', icon: IconClipboardList },
  { to: '/clients', label: 'Клиенты', icon: IconUsers },
  { to: '/masters', label: 'Мастера', icon: IconWrench },
]

const NAV_MANAGE = [
  { to: '/lead-sources', label: 'Источники и реклама', icon: IconMegaphone },
  { to: '/analytics', label: 'Аналитика', icon: IconChartBar },
]

const BOTTOM_NAV = [
  { to: '/', label: 'Главная', icon: IconChartBar, end: true },
  { to: '/requests', label: 'Заявки', icon: IconClipboardList },
  { to: '/clients', label: 'Клиенты', icon: IconUsers },
  { to: '/masters', label: 'Мастера', icon: IconWrench },
]

export function AppLayout() {
  const { auth, logout } = useAuth()
  const navigate = useNavigate()
  const [sheetOpen, setSheetOpen] = useState(false)

  const handleLogout = () => {
    setSheetOpen(false)
    logout()
    navigate('/login', { replace: true })
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) => `nav-item ${isActive ? 'active' : ''}`

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <IconWrench size={18} />
          </div>
          <div>
            <div className="brand-name">ServiceCRM</div>
            <div className="brand-org">Сервисный центр</div>
          </div>
        </div>
        <span className="role-chip">Администратор</span>

        <div className="nav-group-label">Рабочая зона</div>
        {NAV_WORK.map(({ to, label, icon: Icon, ...rest }) => (
          <NavLink key={to} to={to} className={navLinkClass} {...('end' in rest ? { end: true } : {})}>
            <Icon size={17} />
            {label}
          </NavLink>
        ))}

        <div className="nav-group-label">Управление</div>
        {NAV_MANAGE.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={navLinkClass}>
            <Icon size={17} />
            {label}
          </NavLink>
        ))}

        <div className="sidebar-footer">
          {auth && (
            <div className="user-chip">
              <div className="avatar">{initials(auth.username)}</div>
              <div>
                <div className="name">{auth.username}</div>
                <div className="role">Администратор</div>
              </div>
              <button className="logout-btn" onClick={handleLogout} title="Выйти" aria-label="Выйти">
                <IconLogout size={16} />
              </button>
            </div>
          )}
        </div>
      </aside>

      <main className="main">
        <header className="mobile-header">
          <div className="brand-mark" style={{ width: 30, height: 30, borderRadius: 9 }}>
            <IconWrench size={15} />
          </div>
          <div className="brand-name">ServiceCRM</div>
          <span className="role-chip">Администратор</span>
        </header>

        <Outlet />
      </main>

      <nav className="bottom-nav">
        {BOTTOM_NAV.map(({ to, label, icon: Icon, ...rest }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `bn-item ${isActive ? 'active' : ''}`}
            {...('end' in rest ? { end: true } : {})}
          >
            <span className="bn-icon">
              <Icon size={18} />
            </span>
            {label}
          </NavLink>
        ))}
        <button className="bn-item" onClick={() => setSheetOpen(true)}>
          <span className="bn-icon">
            <IconDots size={18} />
          </span>
          Ещё
        </button>
      </nav>

      {sheetOpen && (
        <>
          <div className="sheet-overlay" onClick={() => setSheetOpen(false)} />
          <div className="sheet" role="dialog" aria-label="Дополнительно">
            {NAV_MANAGE.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className="sheet-item" onClick={() => setSheetOpen(false)}>
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
            <button className="sheet-item danger" onClick={handleLogout}>
              <IconLogout size={18} />
              Выйти
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function IconDots({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  )
}
