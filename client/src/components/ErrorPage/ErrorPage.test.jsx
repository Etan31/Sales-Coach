import { render, screen } from '@testing-library/react';
import ErrorPage, { NotFound, AuthError, ServerError } from './ErrorPage.jsx';

describe('ErrorPage', () => {
  it('renders the copy for a known status code', () => {
    render(<ErrorPage code={404} />);
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /page not found/i })).toBeInTheDocument();
  });

  it('honors title/message overrides', () => {
    render(<ErrorPage code={500} title="Boom" message="Custom message" />);
    expect(screen.getByRole('heading', { name: 'Boom' })).toBeInTheDocument();
    expect(screen.getByText('Custom message')).toBeInTheDocument();
  });

  it('NotFound wrapper renders a 404', () => {
    render(<NotFound />);
    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('AuthError wrapper defaults to 401', () => {
    render(<AuthError />);
    expect(screen.getByText('401')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /sign in required/i })).toBeInTheDocument();
  });

  it('ServerError wrapper defaults to 500', () => {
    render(<ServerError />);
    expect(screen.getByText('500')).toBeInTheDocument();
  });
});
