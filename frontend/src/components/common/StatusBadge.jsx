import { getStatusBadge, getStatusLabel } from '../../utils/helpers';

const StatusBadge = ({ status }) => (
  <span className={getStatusBadge(status)}>
    {getStatusLabel(status)}
  </span>
);

export default StatusBadge;
