import { useEffect, useState } from "react";
import { getAllMyTasksApi } from "../../api/taskApi";
import { TASK_STATUS, TASK_PRIORITY } from "../../utils/constants";
import { formatDate, isOverdue } from "../../utils/dateUtils";
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

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getAllMyTasksApi();
        setTasks(data.tasks || []);
      } catch {
        /* */
      }
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <Loader text="Loading tasks..." />;

  const filtered =
    filter === "all" ? tasks : tasks.filter((t) => t.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
          <p className="text-sm text-gray-500 mt-1">
            {filtered.length} task{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {[
          { value: "all", label: "All" },
          { value: TASK_STATUS.TODO, label: "To Do" },
          { value: TASK_STATUS.IN_PROGRESS, label: "In Progress" },
          { value: TASK_STATUS.IN_REVIEW, label: "In Review" },
          { value: TASK_STATUS.DONE, label: "Done" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === tab.value
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <svg
            className="w-12 h-12 text-gray-300 mx-auto mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <p className="text-gray-400">No tasks found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((task) => (
            <div
              key={task._id}
              className={`bg-white rounded-xl border p-4 shadow-sm flex items-start gap-4 ${
                isOverdue(task.dueDate) && task.status !== TASK_STATUS.DONE
                  ? "border-red-200"
                  : "border-gray-100"
              }`}
            >
              <div
                className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${
                  task.status === TASK_STATUS.DONE
                    ? "bg-green-400"
                    : isOverdue(task.dueDate)
                      ? "bg-red-500"
                      : "bg-indigo-400"
                }`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <p
                    className={`font-medium text-gray-900 ${task.status === TASK_STATUS.DONE ? "line-through text-gray-400" : ""}`}
                  >
                    {task.title}
                  </p>
                  <div className="flex gap-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full capitalize ${priorityColors[task.priority]}`}
                    >
                      {task.priority}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusColors[task.status]}`}
                    >
                      {task.status?.replace("_", " ")}
                    </span>
                  </div>
                </div>
                {task.description && (
                  <p className="text-sm text-gray-500 mt-1">
                    {task.description}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                  {task.project?.name && <span>📁 {task.project.name}</span>}
                  {task.dueDate && (
                    <span
                      className={
                        isOverdue(task.dueDate) &&
                        task.status !== TASK_STATUS.DONE
                          ? "text-red-500 font-medium"
                          : ""
                      }
                    >
                      📅 {formatDate(task.dueDate)}
                      {isOverdue(task.dueDate) &&
                        task.status !== TASK_STATUS.DONE &&
                        " (Overdue)"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TasksPage;
