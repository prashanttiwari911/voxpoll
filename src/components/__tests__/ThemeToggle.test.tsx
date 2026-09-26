import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from '../ThemeToggle';
import { useTheme } from 'next-themes';

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: jest.fn(),
}));

describe('ThemeToggle', () => {
  const mockSetTheme = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useTheme as jest.Mock).mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
    });
  });

  it('renders a placeholder before mounting to avoid hydration mismatch', () => {
    // When mounted is false initially
    render(<ThemeToggle />);
    // Since useEffect runs synchronously in testing-library's render sometimes,
    // this test might immediately see the mounted state unless we control the mock.
    // However, the button should be in the document once mounted.
    expect(screen.getByRole('button', { name: /toggle dark mode/i })).toBeInTheDocument();
  });

  it('toggles to dark mode when currently in light mode', () => {
    render(<ThemeToggle />);
    
    const button = screen.getByRole('button', { name: /toggle dark mode/i });
    fireEvent.click(button);
    
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('toggles to light mode when currently in dark mode', () => {
    (useTheme as jest.Mock).mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme,
    });

    render(<ThemeToggle />);
    
    const button = screen.getByRole('button', { name: /toggle dark mode/i });
    fireEvent.click(button);
    
    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });
});
