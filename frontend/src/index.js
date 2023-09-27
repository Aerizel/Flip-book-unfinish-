import React from 'react';
import {BrowserRouter as Router} from "react-router-dom";
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
const apiContext = React.createContext();
const backend = "http://localhost:4000/";

root.render(
  <React.StrictMode>
    <Router>
      <apiContext.Provider value={backend}>
        <App />
      </apiContext.Provider>
    </Router> 
  </React.StrictMode>
);

export {apiContext};
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
