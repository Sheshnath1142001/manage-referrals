
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'submitted':
        return { variant: 'secondary', label: 'Submitted' };
      case 'accepted':
        return { variant: 'default', label: 'Accepted' };
      case 'completed':
        return { variant: 'success', label: 'Completed' };
      default:
        return { variant: 'secondary', label: status };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge variant={config.variant as any}>{config.label}</Badge>
  );
};

export default StatusBadge;
