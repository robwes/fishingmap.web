import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.scss';
import App from '@/app/App';
import { assertRequiredEnv } from '@/shared/utils/assertEnv';

assertRequiredEnv();

createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
);
