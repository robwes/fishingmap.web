import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.scss';
import App from './App';
import { assertRequiredEnv } from './utils/assertEnv';

assertRequiredEnv();

createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
);
