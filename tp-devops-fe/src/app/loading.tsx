import { Spinner } from 'reactstrap';

export default function Loading() {
  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: 200 }}
    >
      <Spinner color="primary" />
      <span className="ms-2">Cargando...</span>
    </div>
  );
}
