// Proprietary - Student Project Tracker FYP - Unauthorized copying prohibited
export function canInsertFeedback(role) {
  return role === "supervisor";
}

export function assertCanInsertFeedback(user) {
  if (!canInsertFeedback(user?.role)) {
    throw new Error("Only a supervisor can submit feedback.");
  }
}
