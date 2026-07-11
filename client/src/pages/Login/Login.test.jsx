import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

// Mock AuthContext so the real one (which imports supabaseClient -> import.meta.env) never loads.
const mockSignIn = jest.fn().mockResolvedValue({ error: null });
jest.mock('../../context/AuthContext.jsx', () => ({
  useAuth: () => ({ session: null, loading: false, signIn: mockSignIn })
}));

import Login from './Login.jsx';

function renderLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );
}

describe('Login page', () => {
  beforeEach(() => {
    mockSignIn.mockClear();
    mockSignIn.mockResolvedValue({ error: null });
  });

  it('renders the sign-in form', () => {
    renderLogin();
    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('submits the typed credentials to signIn', async () => {
    renderLogin();
    await userEvent.type(screen.getByLabelText(/email/i), 'user@test.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(mockSignIn).toHaveBeenCalledWith({ email: 'user@test.com', password: 'secret123' });
  });

  it('shows an error message when signIn fails', async () => {
    mockSignIn.mockResolvedValueOnce({ error: { message: 'Invalid login credentials' } });
    renderLogin();
    await userEvent.type(screen.getByLabelText(/email/i), 'user@test.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/invalid login credentials/i);
  });
});
