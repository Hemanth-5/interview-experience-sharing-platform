import { Outlet } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
// import './Layout.css';

const Layout = () => {
  return (
    <div className="layout">
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
