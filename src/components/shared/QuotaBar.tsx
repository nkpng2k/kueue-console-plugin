import {
  Progress,
  ProgressMeasureLocation,
  ProgressVariant,
  Tooltip,
} from '@patternfly/react-core';

interface QuotaBarProps {
  label: string;
  used: number;
  total: number;
  borrowed?: number;
  unit?: string;
}

export const QuotaBar: React.FC<QuotaBarProps> = ({ label, used, total, borrowed = 0, unit = '' }) => {
  const percentage = total > 0 ? Math.min((used / total) * 100, 100) : 0;

  const variant =
    percentage >= 95
      ? ProgressVariant.danger
      : percentage >= 80
        ? ProgressVariant.warning
        : undefined;

  const tooltipContent = [
    `Used: ${used}${unit}`,
    `Total: ${total}${unit}`,
    borrowed > 0 ? `Borrowed: ${borrowed}${unit}` : null,
    `Available: ${Math.max(total - used, 0)}${unit}`,
  ]
    .filter(Boolean)
    .join(' | ');

  return (
    <Tooltip content={tooltipContent}>
      <Progress
        title={label}
        value={percentage}
        label={`${used}${unit} / ${total}${unit}`}
        measureLocation={ProgressMeasureLocation.outside}
        variant={variant}
        aria-label={`${label} quota usage`}
      />
    </Tooltip>
  );
};
