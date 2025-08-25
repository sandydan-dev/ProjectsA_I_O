const { TaskModel, UserModel } = require("../../model/index");

// utility function for days to current date
const addDays = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

// create task for main role and also regular role

const createTask = async (req, res) => {
  try {
    // extract data from request body
    const { title, description, priority, dueInDays } = req.body;
    const userId = req.user?.id;
    const createdBy = req.user?.name;

    // validation
    // title must required
    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required.",
      });
    }
    // if user id is missing
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. User ID missing.",
      });
    }

    const status = "pending";
    const finalPriority = priority || "low";

    // due date calculation based on "dueInDays" or default 7 days
    const daysToAdd = dueInDays ? parseInt(dueInDays, 10) : 7; // default 7 days
    const dueDate = addDays(daysToAdd);

    // Reminder 1 day before due date
    const reminderDate = new Date(dueDate);
    reminderDate.setDate(reminderDate.getDate() - 1);

    // estimate time in days between now and due date
    const now = new Date();
    const estimatedDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
    const estimatedTime = `${estimatedDays} days`;

    // Attachments from multer
    const attachments = req.files?.map((file) => file.path) || [];

    // Create the task
    const task = await TaskModel.create({
      title,
      description: description || null,
      status,
      priority: finalPriority,
      dueDate,
      attachments,
      reminderDate,
      estimatedTime,
      userId,
      createdBy,
    });

    return res.status(201).json({
      success: true,
      message: "Task created successfully.",
      data: task,
    });
  } catch (error) {
    console.error("Error creating task:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating the task.",
      error: error.message,
    });
  }
};

// get all task its own list and also can see there data by admin/superadmin
const getAllTask = async (req, res) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const userEmail = req.user?.email;

    if (!userId) {
      return res.status(404).json({
        status: false,
        message: "Unauthorized. user id missing.",
      });
    }

    let tasks;

    if (userRole === "admin" || userRole === "super-admin") {
      tasks = await TaskModel.findAll({
        order: [["createdAt", "DESC"]],
      });
    } else {
      tasks = await TaskModel.findAll({
        where: { createdBy: req.user?.name || userEmail },
        order: [["createdAt", "DESC"]],
      });
    }

    if (!tasks || tasks.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No task found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Tasks fetched successfully.",
      data: tasks,
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching tasks.",
      error: error.message,
    });
  }
};

// get task by id
const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role;
    const userName = req.user?.name;
    const userId = req.user?.id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Task ID is required.",
      });
    }

    let tasks;

    // can see by this role by id
    if (userRole === "admin" || userRole === "superadmin") {
      tasks = await TaskModel.findOne({
        where: { id },
      });
    } else {
      // can see user its own data by id
      tasks = await TaskModel.findOne({
        where: {
          id,
          //
          createdBy: userName,
        }, // or userId can also add
      });
    }

    if (!tasks || tasks.length === 0) {
      res.status(404).json({
        status: false,
        message: "Task not found or not authorized.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task ID fetched successfully.",
      data: tasks,
    });
  } catch (error) {
    console.error("Error fetching task:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching the task. id",
      error: error.message,
    });
  }
};

const getTasksByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const userRole = req.user?.role;
    const userId = req.user?.id;

    // Build query condition
    const whereClause = { status };

    // If the user is not admin/super-admin, restrict to their own tasks
    if (userRole !== "admin" && userRole !== "super-admin") {
      whereClause.userId = userId;
    }

    const tasks = await TaskModel.findAll({ where: whereClause });

    // Check if any tasks found
    if (!tasks || tasks.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No tasks found with status "${status}" for this user.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Tasks "${status}" fetched successfully.`,
      data: tasks,
    });
  } catch (error) {
    console.error("Error fetching tasks by status:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching tasks by status.",
      error: error.message,
    });
  }
};

const getTasksByPriority = async (req, res) => {
  try {
    const { priority } = req.params;
    const { role, id, email } = req.user; // from token

    // Base query
    let where = { priority };

    // Normal users can see only their own tasks
    if (!["admin", "superadmin"].includes(role)) {
      // Filter by createdBy email or userId (choose one based on your model)
      where.createdBy = email; // or where.userId = id
    }

    // Fetch tasks
    const tasks = await TaskModel.findAll({
      where,
      attributes: [
        "id",
        "title",
        "description",
        "priority",
        "status",
        "dueDate",
        "reminderDate",
        "estimatedTime",
        "createdBy", // to show who created for admins
        "userId",
        "createdAt",
        "updatedAt",
      ],
    });

    if (!tasks || tasks.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No tasks found with priority "${priority}".`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Tasks fetched successfully.",
      data: tasks,
    });
  } catch (error) {
    console.error("Error fetching tasks by priority:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching priority tasks.",
      error: error.message,
    });
  }
};

// Achieved task
const achieveTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { isArchived } = req.body;
    const role = req.user?.role;
    const email = req.user?.email; // assuming email is stored in token or user object

    // if achieve is not boolean
    if (typeof isArchived !== "boolean") {
      return res.status(400).json({
        status: false,
        message: "isArchived must be true or false.",
      });
    }

    // find task by id/taskId
    const task = await TaskModel.findByPk(id);

    // if task id not found
    if (!task || task.length === 0) {
      return res.status(404).json({
        status: false,
        message: `Task id : ${id} not found`,
      });
    }

    // permission can see : owner and main role can see
    if (!["admin", "superadmin"].includes(role)) {
      if (task.createdBy !== email) {
        return res.status(403).json({
          message: false,
          message: "Not authorized to archive this task.",
        });
      }
    }

    // update isAchieved to true
    task.isArchived = isArchived;
    await task.save();

    console.log("save is achived ", task);
    return res.status(200).json({
      success: true,
      message: `Task ${isArchived ? "archived" : "unarchived"} successfully.`,
      data: task,
    });
  } catch (error) {
    console.error("Error archiving task:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating the archive state.",
      error: error.message,
    });
  }
};


const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      priority,
      status,
      dueInDays,
      attachments,
    } = req.body;
    const role = req.user?.role;
    const email = req.user?.email;

    console.log("Incoming update request for task:", id);
    console.log("Request user:", { role, email });
    console.log("Request body:", req.body);

    // Find task
    const task = await TaskModel.findByPk(id);
    console.log("Task fetched:", task ? task.toJSON() : null);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    // Permission check
    if (!["admin", "superadmin"].includes(role)) {
      if (task.createdBy !== email) {
        console.log("Permission denied: user not owner.");
        return res.status(403).json({
          success: false,
          message: "Not authorized to update this task.",
        });
      }
    }

    // Update fields if provided
    if (title !== undefined) {
      task.title = title;
      console.log("Updated title:", title);
    }
    if (description !== undefined) {
      task.description = description;
      console.log("Updated description:", description);
    }
    if (priority !== undefined) {
      task.priority = priority;
      console.log("Updated priority:", priority);
    }
    if (status !== undefined) {
      task.status = status;
      console.log("Updated status:", status);
    }

    // Update due date and reminder if provided
    if (dueInDays !== undefined) {
      const daysToAdd = parseInt(dueInDays, 10);
      task.dueDate = addDays(daysToAdd);
      task.reminderDate = addDays(daysToAdd - 1);
      const now = new Date();
      task.estimatedTime = Math.ceil(
        (task.dueDate - now) / (1000 * 60 * 60 * 24)
      );
      console.log("Updated dueDate:", task.dueDate);
      console.log("Updated reminderDate:", task.reminderDate);
      console.log("Calculated estimatedTime (days):", task.estimatedTime);
    }

    // Update attachments
    if (attachments !== undefined) {
      task.attachments = attachments;
      console.log("Updated attachments:", attachments);
    }

    await task.save();
    console.log("Task saved successfully.");

    return res.status(200).json({
      success: true,
      message: "Task updated successfully.",
      data: task,
    });
  } catch (error) {
    console.error("Error updating task:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating the task.",
      error: error.message,
    });
  }
};


const deleteTask = async (req, res) => {
  try {
    const { id } = req.params; // task id from URL
    const role = req.user?.role; // logged-in user role
    const email = req.user?.email; // logged-in user email

    console.log("Delete request received for task:", id);
    console.log("Request user:", { role, email });

    // Find the task
    const task = await TaskModel.findByPk(id);
    console.log("Fetched task:", task ? task.toJSON() : null);

    if (!task) {
      console.log("Task id not found.");
      return res.status(404).json({
        success: false,
        message: "Task id not found.",
      });
    }

    // Permission check: admin/superadmin can delete any, owner can delete own
    if (!["admin", "superadmin"].includes(role)) {
      if (task.createdBy !== email) {
        console.log("Permission denied: not owner or admin.");
        return res.status(403).json({
          success: false,
          message: "Not authorized to delete this task.",
        });
      }
    }

    // Delete the task
    await task.destroy();
    console.log("Task deleted successfully:", id);

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully by id.",
    });
  } catch (error) {
    console.error("Error deleting task:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while deleting the task id.",
      error: error.message,
    });
  }
};


module.exports = {
  createTask,
  getAllTask,
  getTaskById,
  getTasksByStatus,
  getTasksByPriority,
  achieveTask,
  updateTask,
  deleteTask
};
