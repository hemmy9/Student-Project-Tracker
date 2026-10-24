export function calculateProgress(tasks = []) {
  if (!Array.isArray(tasks) || tasks.length === 0) return 0;
  const completed = tasks.filter((task) =>
    ["completed", "complete", "done"].includes(
      String(task.status || "").toLowerCase()
    )
  ).length;
  return Math.round((completed / tasks.length) * 100);
}

