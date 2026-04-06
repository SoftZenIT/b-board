import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Import b-board to register the custom element
import 'b-board';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
