import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { ErrorBoundary } from './app/ErrorBoundary';
import './styles.css';
import './runtime-hotfixes.css';

const root = document.getElementById('root');
if (!root) throw new Error('Renderer root element is missing.');

createRoot(root).render(<StrictMode><ErrorBoundary><App /></ErrorBoundary></StrictMode>);
