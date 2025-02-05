router.get("/", auth, async (req, res) => {
  try {
    const tasks = await Task.find({ createdBy: req.user.id }).populate(
      "assignedTo",
      "name"
    );
    console.log("Fetched tasks:", tasks); // Logga de hämtade uppgifterna
    res.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Error fetching tasks" });
  }
});
