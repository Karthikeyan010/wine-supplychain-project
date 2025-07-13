import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { HashRouter } from "react-router-dom"; // You're importing HashRouter

ReactDOM.createRoot(document.getElementById('root')).render(
  <HashRouter> {/* Use HashRouter here */}
    <App />
  </HashRouter>
);
