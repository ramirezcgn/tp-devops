import { Alert } from 'reactstrap';

interface FeedbackAlertProps {
  color: 'success' | 'danger' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
}

export default function FeedbackAlert({
  color,
  message,
  onClose,
}: FeedbackAlertProps) {
  if (!message) return null;
  return (
    <Alert color={color} toggle={onClose} className="mt-3">
      {message}
    </Alert>
  );
}
