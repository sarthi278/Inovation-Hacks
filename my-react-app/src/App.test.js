import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the productivity dashboard', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /good morning, Anubhav/i })).toBeInTheDocument();
  expect(screen.getByText(/active projects/i)).toBeInTheDocument();
});
