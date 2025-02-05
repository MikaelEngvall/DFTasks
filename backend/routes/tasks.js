router.get("/", auth, async (req, res) => {
  try {
    const tasks = await Task.find({ createdBy: req.user.id }).populate(
      "assignedTo",
      "name"
    );
    res.json({ tasks, status: true, msg: "Tasks found successfully.." }); // Se till att returnera i rätt format
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Error fetching tasks" });
  }
});
