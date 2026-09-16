import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App.jsx';
import { AppContextProvider } from './context/AppContext.jsx';
import './styles.css';
import './styles-operations.css';
import './styles-management.css';

createRoot(document.getElementById('root')).render(<StrictMode><BrowserRouter><AppContextProvider><App/></AppContextProvider></BrowserRouter></StrictMode>);
