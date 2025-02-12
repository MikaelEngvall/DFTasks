import Task from "../models/Task.js";
import PendingTask from "../models/PendingTask.js";
import { validateObjectId } from "../utils/validation.js";

// Hämta alla uppgifter (för inloggad användare eller admin)
export const getTasks = async (req, res) => {
  try {
    const { showArchived } = req.query;
    console.log("showArchived parameter:", showArchived); // För debugging

    // Grundläggande query för att hämta användarens uppgifter
    const query = {
      $or: [{ assignedTo: req.user._id }, { createdBy: req.user._id }],
    };

    // Lägg till isActive-filter om showArchived inte är 'true'
    if (showArchived !== "true") {
      query.isActive = true;
    }

    console.log("Final query:", JSON.stringify(query)); // För debugging

    const tasks = await Task.find(query)
      .populate("assignedTo", "name")
      .populate("createdBy", "name")
      .populate({
        path: "comments.createdBy",
        select: "name",
      })
      .sort({ createdAt: -1 });

    console.log(`Found ${tasks.length} tasks`); // För debugging
    res.json(tasks);
  } catch (error) {
    console.error("Error in getTasks:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Hämta alla uppgifter (inklusive inaktiva)
export const getAllTasks = async (req, res) => {
  try {
    // Kontrollera om användaren är admin eller superadmin
    if (req.user.role !== "ADMIN" && req.user.role !== "SUPERADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    const tasks = await Task.find()
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("comments.createdBy", "name email");
    res.json({ tasks });
  } catch (error) {
    console.error("Error in getAllTasks:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Hämta en specifik uppgift
export const getTask = async (req, res) => {
  try {
    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await Task.findById(req.params.id)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("comments.createdBy", "name email");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Kontrollera behörighet
    if (
      req.user.role !== "ADMIN" &&
      req.user.role !== "SUPERADMIN" &&
      task.assignedTo?._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(task);
  } catch (error) {
    console.error("Error in getTask:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Skapa ny uppgift
export const createTask = async (req, res) => {
  try {
    // Kontrollera om användaren är admin eller superadmin
    if (req.user.role !== "ADMIN" && req.user.role !== "SUPERADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Validera nödvändiga fält
    const { title, description, assignedTo, dueDate } = req.body;
    if (!title || !description || !dueDate) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    const task = new Task({
      title,
      description,
      assignedTo: assignedTo || null,
      dueDate,
      createdBy: req.user._id,
      status: "pending",
      isActive: true,
      comments: [],
    });

    const savedTask = await task.save();
    const populatedTask = await Task.findById(savedTask._id)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    res.status(201).json({ task: populatedTask });
  } catch (error) {
    console.error("Error in createTask:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Uppdatera uppgift
export const updateTask = async (req, res) => {
  try {
    // Kontrollera om användaren är admin eller superadmin
    if (req.user.role !== "ADMIN" && req.user.role !== "SUPERADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    )
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("comments.createdBy", "name email");

    res.json({ task: updatedTask });
  } catch (error) {
    console.error("Error in updateTask:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Radera (inaktivera) uppgift
export const deleteTask = async (req, res) => {
  try {
    // Kontrollera om användaren är admin eller superadmin
    if (req.user.role !== "ADMIN" && req.user.role !== "SUPERADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.isActive = false;
    await task.save();

    res.json({ message: "Task deactivated successfully" });
  } catch (error) {
    console.error("Error in deleteTask:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Växla uppgiftsstatus
export const toggleTaskStatus = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.isActive = !task.isActive;
    await task.save();

    const updatedTask = await Task.findById(req.params.id)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("comments.createdBy", "name email");

    res.json(updatedTask);
  } catch (error) {
    console.error("Error toggling task status:", error);
    res.status(500).json({ message: "Error toggling task status" });
  }
};

// Växla kommentarstatus
export const toggleCommentStatus = async (req, res) => {
  try {
    // Kontrollera om användaren är admin eller superadmin
    if (req.user.role !== "ADMIN" && req.user.role !== "SUPERADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { taskId, commentId } = req.params;

    if (!validateObjectId(taskId) || !validateObjectId(commentId)) {
      return res.status(400).json({ message: "Invalid task or comment ID" });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const comment = task.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    comment.isActive = !comment.isActive;
    await task.save();

    res.json({
      message: `Comment ${
        comment.isActive ? "activated" : "deactivated"
      } successfully`,
      task,
    });
  } catch (error) {
    console.error("Error in toggleCommentStatus:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Lägg till kommentar
export const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const taskId = req.params.id;

    if (!content) {
      return res.status(400).json({ message: "Kommentarinnehåll krävs" });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Uppgift hittades inte" });
    }

    // Initiera översättningar med originalinnehållet
    const translations = {};

    // Lista över alla språk som vi behöver översättningar för
    const allLanguages = ["en", "sv", "pl", "uk"];

    // Översätt till alla språk
    for (const lang of allLanguages) {
      try {
        const response = await fetch(
          `https://translation.googleapis.com/language/translate/v2?key=${process.env.GOOGLE_TRANSLATE_API_KEY}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              q: content,
              target: lang,
              format: "text",
            }),
          }
        );

        if (!response.ok) {
          console.error(`Översättningsfel för ${lang}:`, await response.text());
          continue;
        }

        const data = await response.json();
        if (data.data?.translations?.[0]?.translatedText) {
          translations[lang] = data.data.translations[0].translatedText;
        }
      } catch (error) {
        console.error(`Fel vid översättning till ${lang}:`, error);
        // Om översättning misslyckas, använd originalinnehållet
        translations[lang] = content;
      }
    }

    // Skapa och lägg till kommentaren med översättningar
    const comment = {
      content,
      translations,
      createdBy: req.user._id,
    };

    task.comments.push(comment);
    await task.save();

    // Populera användarinformation för den nya kommentaren
    const updatedTask = await Task.findById(taskId)
      .populate("comments.createdBy", "name email")
      .populate("assignedTo", "name email");

    res.json({ task: updatedTask });
  } catch (error) {
    console.error("Fel vid tillägg av kommentar:", error);
    res.status(500).json({ message: "Serverfel vid tillägg av kommentar" });
  }
};

// Hämta alla väntande uppgifter
export const getPendingTasks = async (req, res) => {
  try {
    // Kontrollera om användaren är admin eller superadmin
    if (req.user.role !== "ADMIN" && req.user.role !== "SUPERADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { showArchived } = req.query;
    let query = {};

    if (!showArchived) {
      query.status = "pending";
    }

    const pendingTasks = await PendingTask.find(query).sort({
      createdAt: -1,
    });

    res.json({ pendingTasks });
  } catch (error) {
    console.error("Error in getPendingTasks:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Godkänn väntande uppgift
export const approvePendingTask = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN" && req.user.role !== "SUPERADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { taskId } = req.params;
    const { assignedTo, dueDate } = req.body;

    if (!validateObjectId(taskId)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const pendingTask = await PendingTask.findById(taskId);
    if (!pendingTask) {
      return res.status(404).json({ message: "Pending task not found" });
    }

    // Initiera översättningar med alla språk
    const translations = {};
    const allLanguages = ["sv", "en", "pl", "uk"];
    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;

    // Översätt till alla språk
    for (const targetLang of allLanguages) {
      try {
        const [titleResponse, descResponse] = await Promise.all([
          fetch(
            `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                q: pendingTask.title,
                target: targetLang,
                format: "text",
              }),
            }
          ),
          fetch(
            `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                q: pendingTask.description,
                target: targetLang,
                format: "text",
              }),
            }
          ),
        ]);

        const [titleData, descData] = await Promise.all([
          titleResponse.json(),
          descResponse.json(),
        ]);

        translations[targetLang] = {
          title: titleData.data.translations[0].translatedText,
          description: descData.data.translations[0].translatedText,
        };
      } catch (error) {
        console.error(`Translation error for ${targetLang}:`, error);
        // Om översättningen misslyckas, använd originaltexten
        translations[targetLang] = {
          title: pendingTask.title,
          description: pendingTask.description,
        };
      }
    }

    // Spara översättningarna i pending task
    pendingTask.translations = translations;
    await pendingTask.save();

    // Skapa ny uppgift med översättningar
    const task = new Task({
      title: pendingTask.title,
      description: pendingTask.description,
      translations,
      assignedTo,
      dueDate,
      createdBy: req.user._id,
      status: "pending",
      reporterName: pendingTask.reporterName,
      reporterEmail: pendingTask.reporterEmail,
      reporterPhone: pendingTask.reporterPhone,
      address: pendingTask.address,
      apartmentNumber: pendingTask.apartmentNumber,
    });

    await task.save();

    // Uppdatera pending task status till approved
    pendingTask.status = "approved";
    pendingTask.approvedBy = req.user._id;
    pendingTask.approvedAt = new Date();
    await pendingTask.save();

    const populatedTask = await Task.findById(task._id)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    res.json({ message: "Task approved successfully", task: populatedTask });
  } catch (error) {
    console.error("Error in approvePendingTask:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Avvisa väntande uppgift
export const declinePendingTask = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN" && req.user.role !== "SUPERADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { taskId } = req.params;
    const { reason } = req.body;

    if (!validateObjectId(taskId)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const pendingTask = await PendingTask.findById(taskId);
    if (!pendingTask) {
      return res.status(404).json({ message: "Pending task not found" });
    }

    // Uppdatera pending task status till declined
    pendingTask.status = "declined";
    pendingTask.declinedBy = req.user._id;
    pendingTask.declinedAt = new Date();
    pendingTask.declineReason = reason;
    await pendingTask.save();

    res.json({ message: "Task declined successfully", pendingTask });
  } catch (error) {
    console.error("Error in declinePendingTask:", error);
    res.status(500).json({ message: "Server error" });
  }
};
