import { render, screen } from '@testing-library/react';
import App from './App';

// Define a test suite for the App component
describe('App', () => {
    // Define a test case for rendering the App component
    test('renders App component', () => {
        // Render the App component
        render(<App />);
        // Expect that the App component is in the document
        expect(screen.getByText(/App/i)).toBeInTheDocument();
    });
});
