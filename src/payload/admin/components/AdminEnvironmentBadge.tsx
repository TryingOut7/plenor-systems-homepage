import React from 'react';

type Props = {
  environmentLabel?: string;
};

const AdminEnvironmentBadge = ({ environmentLabel }: Props) => {
  if (!environmentLabel) return null;

  return (
    <div className="admin-environment-badge" aria-label="Current admin environment">
      Environment: {environmentLabel}
    </div>
  );
};

export default AdminEnvironmentBadge;
