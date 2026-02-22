import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getProjectsApi } from "../../api/projectApi";
import { getAllMyTasksApi } from "../../api/taskApi";
import { TASK_STATUS, TASK_PRIORITY } from "../../utils/constants";
import { formatDate, isOverdue } from "../../utils/dateUtils";
import Loader from "../../components/common/Loader";

const StatCard = ({ title, value, icon, color }) => (
  <div className={`bg-white rounded-xl p-6 border border-gray-100 shadow-sm`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
      </div>
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center ${color.replace("text-", "bg-").replace("600", "100")}`}
      >
        {icon}
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, tRes] = await Promise.all([
          getProjectsApi(),
          getAllMyTasksApi(),
        ]);
        setProjects(pRes.data.projects || []);
        setTasks(tRes.data.tasks || []);
      } catch {
        //
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loader text="Loading dashboard..." />;

  const pendingTasks = tasks.filter((t) => t.status !== TASK_STATUS.DONE);
  const overdueTasks = tasks.filter(
    (t) => isOverdue(t.dueDate) && t.status !== TASK_STATUS.DONE,
  );
  const doneTasks = tasks.filter((t) => t.status === TASK_STATUS.DONE);

  const priorityColors = {
    [TASK_PRIORITY.LOW]: "bg-gray-100 text-gray-700",
    [TASK_PRIORITY.MEDIUM]: "bg-yellow-100 text-yellow-700",
    [TASK_PRIORITY.HIGH]: "bg-orange-100 text-orange-700",
    [TASK_PRIORITY.URGENT]: "bg-red-100 text-red-700",
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Good{" "}
          {new Date().getHours() < 12
            ? "morning"
            : new Date().getHours() < 18
              ? "afternoon"
              : "evening"}
          , {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-gray-500 mt-1">
          Here&apos;s what&apos;s happening today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Projects"
          value={projects.length}
          color="text-indigo-600"
          icon={
            <svg
              className="w-6 h-6 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          }
        />
        <StatCard
          title="Pending Tasks"
          value={pendingTasks.length}
          color="text-yellow-600"
          icon={
            <svg
              className="w-6 h-6 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
        <StatCard
          title="Overdue Tasks"
          value={overdueTasks.length}
          color="text-red-600"
          icon={
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          }
        />
        <StatCard
          title="Completed Tasks"
          value={doneTasks.length}
          color="text-green-600"
          icon={
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Projects</h2>
            <Link
              to="/projects"
              className="text-sm text-indigo-600 hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {projects.slice(0, 5).length === 0 ? (
              <p className="p-5 text-sm text-gray-400 text-center">
                No projects yet
              </p>
            ) : (
              projects.slice(0, 5).map((project) => (
                <Link
                  key={project._id}
                  to={`/projects/${project._id}`}
                  className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-indigo-700 font-semibold text-sm">
                      {project.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {project.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {project.members?.length || 0} members • Due{" "}
                      {formatDate(project.dueDate)}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full capitalize ${
                      project.status === "active"
                        ? "bg-green-100 text-green-700"
                        : project.status === "completed"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {project.status}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* My Tasks */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">My Tasks</h2>
            <Link
              to="/tasks"
              className="text-sm text-indigo-600 hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {pendingTasks.slice(0, 5).length === 0 ? (
              <p className="p-5 text-sm text-gray-400 text-center">
                No pending tasks 🎉
              </p>
            ) : (
              pendingTasks.slice(0, 5).map((task) => (
                <div key={task._id} className="flex items-center gap-3 p-4">
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      isOverdue(task.dueDate) ? "bg-red-500" : "bg-yellow-400"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {task.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      Due {formatDate(task.dueDate)}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full capitalize ${priorityColors[task.priority] || "bg-gray-100 text-gray-700"}`}
                  >
                    {task.priority}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
