export function formatTaskDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  try {
    return new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
      timeZone: "Asia/Riyadh",
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(new Date(dateStr));
  } catch {
    return String(dateStr);
  }
}

export function getTaskColor(task: { workProjectSection?: { color?: string | null } | null, taskStatus: string }) {
  if (task.workProjectSection?.color) {
    return task.workProjectSection.color;
  }
  switch (task.taskStatus) {
    case 'DONE': return '#10b981'; // emerald-500
    case 'IN_PROGRESS': return '#3b82f6'; // blue-500
    case 'CANCELLED': return '#6b7280'; // gray-500
    default: return '#f59e0b'; // amber-500
  }
}
