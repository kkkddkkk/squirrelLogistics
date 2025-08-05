import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
<<<<<<< HEAD
  <BrowserRouter>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </BrowserRouter>
=======
  <React.StrictMode>
<<<<<<< Updated upstream
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
=======
    <App />
  </React.StrictMode>

>>>>>>> Stashed changes
>>>>>>> feature/paymentPage/GPT-21
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
