import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
    { ignores: ['build/', 'node_modules/'] },
    js.configs.recommended,
    {
        files: ['src/**/*.{js,jsx}'],
        plugins: {
            react,
            'react-hooks': reactHooks,
        },
        languageOptions: {
            ecmaVersion: 2023,
            sourceType: 'module',
            globals: {
                ...globals.browser,
            },
            parserOptions: {
                ecmaFeatures: { jsx: true },
            },
        },
        settings: {
            react: { version: 'detect' },
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            // The imperative Google Maps integration (Circle, useData,
            // clusterer refs) and standard prop-sync effects predate these
            // compiler-alignment rules — advisory until that code is
            // restructured.
            'react-hooks/refs': 'warn',
            'react-hooks/set-state-in-effect': 'warn',
            // Mark JSX usage so no-unused-vars understands React imports
            // and components referenced only inside JSX.
            'react/jsx-uses-react': 'error',
            'react/jsx-uses-vars': 'error',
            // Warnings, not errors: `npm run lint` fails CI on errors only.
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
        },
    },
    {
        files: ['**/*.test.js', 'eslint.config.js', 'vite.config.js'],
        languageOptions: {
            globals: {
                ...globals.node,
            },
        },
    },
];
