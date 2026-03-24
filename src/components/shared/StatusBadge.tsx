import {
  Label,
} from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InProgressIcon,
  PauseCircleIcon,
  UnknownIcon,
  BanIcon,
  HourglassStartIcon,
} from '@patternfly/react-icons';
import { WorkloadPhase } from '../../types';

type StatusType = 'healthy' | 'warning' | 'error' | 'unknown' | 'paused' | 'active' | 'inactive';

interface StatusBadgeProps {
  status: StatusType | WorkloadPhase;
}

type LabelColor = 'green' | 'orange' | 'red' | 'blue' | 'grey' | 'teal';

const statusConfig: Record<string, { color: LabelColor; icon: React.ComponentType; label: string }> = {
  healthy: { color: 'green', icon: CheckCircleIcon, label: 'Healthy' },
  active: { color: 'green', icon: CheckCircleIcon, label: 'Active' },
  warning: { color: 'orange', icon: ExclamationTriangleIcon, label: 'Warning' },
  error: { color: 'red', icon: ExclamationCircleIcon, label: 'Error' },
  inactive: { color: 'grey', icon: BanIcon, label: 'Inactive' },
  paused: { color: 'orange', icon: PauseCircleIcon, label: 'Paused' },
  unknown: { color: 'grey', icon: UnknownIcon, label: 'Unknown' },
  Pending: { color: 'blue', icon: HourglassStartIcon, label: 'Pending' },
  QuotaReserved: { color: 'teal', icon: InProgressIcon, label: 'Quota Reserved' },
  Admitted: { color: 'green', icon: CheckCircleIcon, label: 'Admitted' },
  Running: { color: 'green', icon: InProgressIcon, label: 'Running' },
  Evicted: { color: 'orange', icon: ExclamationTriangleIcon, label: 'Evicted' },
  Finished: { color: 'grey', icon: CheckCircleIcon, label: 'Finished' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = statusConfig[status] ?? statusConfig.unknown;
  const Icon = config.icon;

  return (
    <Label color={config.color} icon={<Icon />}>
      {config.label}
    </Label>
  );
};
