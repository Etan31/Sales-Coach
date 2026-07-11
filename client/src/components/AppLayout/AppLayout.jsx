import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import SalesCoachLogo from '../SalesCoachLogo/SalesCoachLogo.jsx';
import Button from '../Button/Button.jsx';
import styles from './AppLayout.module.css';

/** Authenticated shell: top bar (logo + nav + logout) and a routed main content area. */
function AppLayout() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    navigate('/login', { replace: true });
  }

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <div className={`${styles.topbarInner} sc-container`}>
          <NavLink to="/" className={styles.brand}>
            <SalesCoachLogo />
            <span className={styles.brandName}>Sales Coach</span>
          </NavLink>
          <nav className={styles.nav}>
            <NavLink to="/" end className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}>
              Dashboard
            </NavLink>
            <Button variant="ghost" onClick={handleLogout}>
              Logout
            </Button>
          </nav>
        </div>
      </header>
      <main className="sc-container">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
