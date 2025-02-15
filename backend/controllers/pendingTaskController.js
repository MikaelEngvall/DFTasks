export const declinePendingTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { declineReason } = req.body;

    if (!declineReason) {
      return res.status(400).json({ message: "Decline reason is required" });
    }

    const pendingTask = await PendingTask.findById(taskId);
    if (!pendingTask) {
      return res.status(404).json({ message: "Pending task not found" });
    }

    pendingTask.status = "declined";
    pendingTask.declinedBy = req.user._id;
    pendingTask.declinedAt = new Date();
    pendingTask.declineReason = declineReason;

    await pendingTask.save();

    res.json({ message: "Task declined successfully", task: pendingTask });
  } catch (error) {
    console.error("Error in declinePendingTask:", error);
    res.status(500).json({ message: "Server error" });
  }
}; 