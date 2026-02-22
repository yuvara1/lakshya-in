import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProjectByIdApi, updateProjectApi } from "../../api/projectApi";
import {
  getTasksApi,
  createTaskApi,
  updateTaskApi,
  deleteTaskApi,
} from "../../api/taskApi";
import { TASK_STATUS, TASK_PRIORITY } from "../../utils/constants";
import { formatDate, isOverdue } from "../../utils/dateUtils";
import { useAuth } from "../../context/AuthContext";
import { canManageTasks } from "../../utils/role";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import Loader from "../../components/common/Loader";

const statusColors = {
  [TASK_STATUS.TODO]: "bg-gray-100 text-gray-700",
  [TASK_STATUS.IN_PROGRESS]: "bg-blue-100 text-blue-700",
  [TASK_STATUS.IN_REVIEW]: "bg-yellow-100 text-yellow-700",
  [TASK_STATUS.DONE]: "bg-green-100 text-green-700",
};

const priorityColors = {
  [TASK_PRIORITY.LOW]: "bg-gray-100 text-gray-600",
  [TASK_PRIORITY.MEDIUM]: "bg-yellow-100 text-yellow-700",
  [TASK_PRIORITY.HIGH]: "bg-orange-100 text-orange-700",
  [TASK_PRIORITY.URGENT]: "bg-red-100 text-red-700",
};

const ProjectDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [taskModal, setTaskModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: TASK_PRIORITY.MEDIUM,
    status: TASK_STATUS.TODO,
    dueDate: "",
    assignedTo: "",
  });

  const fetchData = async () => {
    try {
      const [pRes, tRes] = await Promise.all([
        getProjectByIdApi(id),
        getTasksApi(id),
      ]);
      setProject(pRes.data.project);
      setTasks(tRes.data.tasks || []);
    } catch {
      navigate("/projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const openCreateModal = () => {
    setEditTask(null);
    setForm({
      title: "",
      description: "",
      priority: TASK_PRIORITY.MEDIUM,
      status: TASK_STATUS.TODO,
      dueDate: "",
      assignedTo: "",
    });
    setTaskModal(true);
  };

  const openEditModal = (task) => {
    setEditTask(task);
    setForm({
      title: task.title || "",
      description: task.description || "",
      priority: task.priority || TASK_PRIORITY.MEDIUM,
      status: task.status || TASK_STATUS.TODO,
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
      assignedTo: task.assignedTo?._id || task.assignedTo || "",
    });
    setTaskModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editTask) {
        await updateTaskApi(id, editTask._id, form);
      } else {
        await createTaskApi(id, form);
      }
      setTaskModal(false);
      fetchData();
    } catch {
      /* */
    }
    setSubmitting(false);
  };

  const handleDelete = async (taskId) => {
    if (!confirm("Delete this task?")) return;
    await deleteTaskApi(id, taskId);
    setTasks((t) => t.filter((task) => task._id !== taskId));
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      await updateTaskApi(id, taskId, { status });
      setTasks((t) =>
        t.map((task) => (task._id === taskId ? { ...task, status } : task)),
      );
    } catch {
      /* */
    }
  };

  if (loading) return <Loader text="Loading project..." />;
  if (!project) return null;

  const columns = [
    TASK_STATUS.TODO,
    TASK_STATUS.IN_PROGRESS,
    TASK_STATUS.IN_REVIEW,
    TASK_STATUS.DONE,
  ];

  const columnLabels = {
    [TASK_STATUS.TODO]: "To Do",
    [TASK_STATUS.IN_PROGRESS]: "In Progress",
    [TASK_STATUS.IN_REVIEW]: "In Review",
    [TASK_STATUS.DONE]: "Done",
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <button
            onClick={() => navigate("/projects")}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Projects
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          {project.description && (
            <p className="text-gray-500 mt-1">{project.description}</p>
          )}
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-gray-400">
              Due {formatDate(project.dueDate)}
            </span>
            <span
              className={`text-xs px-2 py-1 rounded-full capitalize ${
                project.status === "active"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {project.status}
            </span>
          </div>
        </div>
        {canManageTasks(user) && (
          <Button onClick={openCreateModal}>
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Task
          </Button>
        )}
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col);
          return (
            <div key={col} className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">
                  {columnLabels[col]}
                </h3>
                <span className="text-xs bg-white text-gray-500 border border-gray-200 px-2 py-0.5 rounded-full">
                  {colTasks.length}
                </span>
              </div>
              <div className="space-y-3">
                {colTasks.map((task) => (
                  <div
                    key={task._id}
                    className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">
                        {task.title}
                      </p>
                      {canManageTasks(user) && (
                        <div className="flex gap-1 flex-shrink-0">
                          <button
                            onClick={() => openEditModal(task)}
                            className="p-1 text-gray-300 hover:text-indigo-500"
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(task._id)}
                            className="p-1 text-gray-300 hover:text-red-500"
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                    {task.description && (
                      <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded capitalize ${priorityColors[task.priority]}`}
                      >
                        {task.priority}
                      </span>
                      {task.dueDate && (
                        <span
                          className={`text-xs ${isOverdue(task.dueDate) && task.status !== TASK_STATUS.DONE ? "text-red-500" : "text-gray-400"}`}
                        >
                          {formatDate(task.dueDate)}
                        </span>
                      )}
                    </div>
                    {canManageTasks(user) && col !== TASK_STATUS.DONE && (
                      <select
                        value={task.status}
                        onChange={(e) =>
                          handleStatusChange(task._id, e.target.value)
                        }
                        className="mt-2 w-full text-xs border border-gray-200 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                      >
                        {Object.values(TASK_STATUS).map((s) => (
                          <option key={s} value={s}>
                            {columnLabels[s]}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                ))}
                {colTasks.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">
                    No tasks
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Modal */}
      <Modal
        isOpen={taskModal}
        onClose={() => setTaskModal(false)}
        title={editTask ? "Edit Task" : "Create Task"}
      >
        <form onSubmit={handleSubmit}>
          <Input
            id="title"
            label="Title"
            placeholder="Task title"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            required
          />
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={3}
              placeholder="Task details..."
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.priority}
                onChange={(e) =>
                  setForm((p) => ({ ...p, priority: e.target.value }))
                }
              >
                {Object.values(TASK_PRIORITY).map((p) => (
                  <option key={p} value={p} className="capitalize">
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.status}
                onChange={(e) =>
                  setForm((p) => ({ ...p, status: e.target.value }))
                }
              >
                {Object.values(TASK_STATUS).map((s) => (
                  <option key={s} value={s}>
                    {s.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Input
            id="dueDate"
            label="Due Date"
            type="date"
            value={form.dueDate}
            onChange={(e) =>
              setForm((p) => ({ ...p, dueDate: e.target.value }))
            }
          />
          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setTaskModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={submitting} className="flex-1">
              {editTask ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectDetailsPage;
