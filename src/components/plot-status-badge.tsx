import { Badge } from './ui/badge';
import type { PlotStatus } from '@/lib/definitions';

interface PlotStatusBadgeProps {
  status?: PlotStatus;
}

export function PlotStatusBadge({ status = 'Available' }: PlotStatusBadgeProps) {
  const getStatusColor = (status: PlotStatus) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200';
      case 'Reserved':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-200';
      case 'Sold':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-200';
      case 'Under Negotiation':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300 border-gray-200';
    }
  };

  return (
    <Badge variant="outline" className={`${getStatusColor(status)} font-medium`}>
      {status}
    </Badge>
  );
}
