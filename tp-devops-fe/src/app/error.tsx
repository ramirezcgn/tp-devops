'use client';

import { Alert } from 'reactstrap';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="my-5">
      <Alert color="danger">
        <h4 className="alert-heading">¡Ocurrió un error!</h4>
        <p>{error.message}</p>
        <button className="btn btn-danger mt-3" onClick={() => reset()}>
          Reintentar
        </button>
      </Alert>
    </div>
  );
}
