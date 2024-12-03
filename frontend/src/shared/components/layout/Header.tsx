import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { OFFICER_SEARCH_SCOPE, NCO_SEARCH_SCOPE, SOLDIER_SEARCH_SCOPE } from '@/shared/types/navigation';
import '@/styles/components/header.css';

const Header: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const getSearchScope = () => {
    switch (user?.role) {
      case 'officer':
        return OFFICER_SEARCH_SCOPE;
      case 'nco':
        return NCO_SEARCH_SCOPE;
      case 'soldier':
        return SOLDIER_SEARCH_SCOPE;
      default:
        return SOLDIER_SEARCH_SCOPE;
    }
  };

  const getSearchPlaceholder = () => {
    const scope = getSearchScope();
    const searchTypes = [
      scope.property && 'property',
      scope.serialNumbers && 'serial numbers',
      scope.personnel && 'personnel',
      scope.documents && 'documents'
    ].filter(Boolean).join(', ');
    
    return `Search ${searchTypes}...`;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  const handleLogout = () => {
    // TODO: Implement logout functionality
    navigate('/login');
  };

  const handleLogoClick = () => {
    switch (user?.role) {
      case 'officer':
        navigate('/officer/dashboard');
        break;
      case 'nco':
        navigate('/nco/dashboard');
        break;
      case 'soldier':
        navigate('/soldier/dashboard');
        break;
      default:
        navigate('/login');
    }
  };

  return (
    <header className="header">
      <div className="header__left">
        <div className="header-logo" onClick={handleLogoClick} role="button" tabIndex={0}>
          HandReceipt
        </div>
      </div>

      <div className="header__center">
        <form onSubmit={handleSearch} className="header__search">
          <button type="submit" className="header__search-button">
            <i className="material-icons">search</i>
          </button>
          <input
            type="text"
            placeholder={getSearchPlaceholder()}
            className="header__search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      <div className="header__right">
        <button className="header__notification-btn">
          <i className="material-icons">notifications</i>
          <span className="header__notification-badge">3</span>
        </button>

        <div className="header__profile" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="header__profile-btn"
          >
            <div className="header__rank-insignia">
              <img
                src={`/ranks/${user?.rank?.toLowerCase()}.png`}
                alt={`${user?.rank} Insignia`}
                className="rank-image"
              />
            </div>
            <div className="header__user-info">
              <span className="header__username">{`${user?.rank} ${user?.name}`}</span>
              <span className="header__user-role">{user?.role}</span>
            </div>
            <i className="material-icons">
              {isDropdownOpen ? 'expand_less' : 'expand_more'}
            </i>
          </button>

          {isDropdownOpen && (
            <div className="header__profile-menu">
              <Link to="/profile" className="header__menu-item">
                <i className="material-icons">account_circle</i>
                Profile
              </Link>
              <Link to="/settings" className="header__menu-item">
                <i className="material-icons">settings</i>
                Settings
              </Link>
              <div className="header__menu-divider"></div>
              <button
                onClick={handleLogout}
                className="header__menu-item header__menu-item--danger"
              >
                <i className="material-icons">logout</i>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 