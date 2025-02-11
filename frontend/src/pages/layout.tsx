import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="app-layout">
      <Header />
      <div className="main-content">
        <Sidebar variant="permanent" />
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
