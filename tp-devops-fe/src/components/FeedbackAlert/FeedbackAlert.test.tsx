import { render, screen } from '@testing-library/react';
import FeedbackAlert from './FeedbackAlert';

describe('FeedbackAlert', () => {
  it('muestra el mensaje y el color correcto (success)', () => {
    render(<FeedbackAlert color="success" message="¡Todo bien!" />);
    expect(screen.getByText('¡Todo bien!')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveClass('alert-success');
  });

  it('muestra el mensaje y el color correcto (danger)', () => {
    render(<FeedbackAlert color="danger" message="¡Error!" />);
    expect(screen.getByText('¡Error!')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveClass('alert-danger');
  });

  it('no renderiza nada si no hay mensaje', () => {
    const { container } = render(<FeedbackAlert color="success" message="" />);
    expect(container).toBeEmptyDOMElement();
  });
});
