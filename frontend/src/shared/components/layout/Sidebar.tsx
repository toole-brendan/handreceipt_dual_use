/* frontend/src/ui/components/common/Sidebar.tsx */

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { 
  OFFICER_NAV_ITEMS, 
  NCO_NAV_ITEMS, 
  SOLDIER_NAV_ITEMS,
  NavItem 
} from '@/shared/components/common/navigation-config';
import '@/styles/components/sidebar.css';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const getNavItems = (): NavItem[] => {
    switch (user?.role) {
      case 'officer':
        return OFFICER_NAV_ITEMS;
      case 'nco':
        return NCO_NAV_ITEMS;
      case 'soldier':
        return SOLDIER_NAV_ITEMS;
      default:
        return SOLDIER_NAV_ITEMS;
    }
  };

  const handleLogout = () => {
    // TODO: Implement logout functionality
    navigate('/login');
  };

  const navItems = getNavItems();

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => 
              `sidebar-item ${isActive ? 'active' : ''}`
            }
          >
            <i className="material-icons sidebar-item-icon">{item.icon}</i>
            <span className="sidebar-item-text">{item.text}</span>
          </NavLink>
        ))}

        <button 
          onClick={handleLogout}
          className="sidebar-item sidebar-item--logout"
        >
          <i className="material-icons sidebar-item-icon">logout</i>
          <span className="sidebar-item-text">Logout</span>
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;