import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import {store} from './Reducers/index';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// "proxy": "http://localhost:5000/api",

root.render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>    
  </Provider>
);

 