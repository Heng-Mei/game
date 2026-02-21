import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app/App';
import './styles/reset.scss';
import './styles/global.scss';
import './theme/theme.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
