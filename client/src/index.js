import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
// import './index.css';
// import App from './App';
import Maintenance from './Maintenance';

// Maintenance mode - render Maintenance component instead of App
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <Maintenance />
    {/* <App /> */}
  </StrictMode>
);
