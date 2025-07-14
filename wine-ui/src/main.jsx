import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from "react-router-dom"; // ⬅️ Change here

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>  {/* ⬅️ Use this instead of HashRouter */}
    <App />
  </BrowserRouter>
);
