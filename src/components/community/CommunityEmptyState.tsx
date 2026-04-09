interface CommunityEmptyStateProps {
  icon: string;
  title: string;
  message: string;
}

export function CommunityEmptyState({ icon, title, message }: CommunityEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-4xl mb-4">{icon}</div>
      <p className="text-lg font-serif mb-2" style={{ color: '#f5e6b8' }}>{title}</p>
      <p className="text-sm" style={{ color: '#a7c5ba' }}>{message}</p>
    </div>
  );
}
