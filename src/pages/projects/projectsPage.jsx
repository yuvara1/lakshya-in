import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getProjectsApi,
  createProjectApi,
  deleteProjectApi,
} from "../../api/projectApi";
import { formatDate } from "../../utils/dateUtils";
import { useAuth } from "../../context/AuthContext";
import { canManageProjects } from "../../utils/role";
import { PROJECT_STATUS, PROJECT_PRIORITY } from "../../utils/constants";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import Loader from "../../components/common/Loader";

const statusColors = {
  PLANNED: "bg-yellow-100 text-yellow-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
};

const priorityColors = {
  LOW: "bg-gray-100 text-gray-600",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  HIGH: "bg-red-100 text-red-700",
};

const ProjectsPage = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    projectName: "",
    description: "",
    startDate: "",
    endDate: "",
    status: PROJECT_STATUS.PLANNED,
    priority: PROJECT_PRIORITY.MEDIUM,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data } = await getProjectsApi();
      setProjects(data.projects || []);
    } catch {
      /**/
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createProjectApi(form);
      setModalOpen(false);
      setForm({
        projectName: "",
        description: "",
        startDate: "",
        endDate: "",
        status: PROJECT_STATUS.PLANNED,
        priority: PROJECT_PRIORITY.MEDIUM,
      });
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create project");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.preventDefault();
    if (!confirm("Delete this project?")) return;
    try {
      await deleteProjectApi(id);
      setProjects((p) => p.filter((proj) => proj._id !== id));
    } catch {
      /**/
    }
  };

  if (loading) return <Loader text="Loading projects..." />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-500 mt-1">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </p>
        </div>
        {canManageProjects(user) && (
          <Button onClick={() => setModalOpen(true)}>
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
            New Project
          </Button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
          <p className="text-gray-500">
            No projects yet. Create your first project!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link
              key={project._id}
              to={`/projects/${project._id}`}
              className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all p-5 flex flex-col"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <span className="text-indigo-700 font-bold">
                    {project.projectName?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${priorityColors[project.priority] || "bg-gray-100 text-gray-700"}`}
                  >
                    {project.priority}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[project.status] || "bg-gray-100 text-gray-700"}`}
                  >
                    {project.status?.replace("_", " ")}
                  </span>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 mb-1">
                {project.projectName}
              </h3>
              <p className="text-sm text-gray-500 flex-1 line-clamp-2 mb-4">
                {project.description || "No description"}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-gray-50 text-xs text-gray-400">
                <span>
                  📅 {formatDate(project.startDate)} →{" "}
                  {formatDate(project.endDate)}
                </span>
                {canManageProjects(user) && (
                  <button
                    onClick={(e) => handleDelete(project._id, e)}
                    className="p-1 text-gray-300 hover:text-red-500 transition-colors"
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create New Project"
      >
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}
        <form onSubmit={handleCreate}>
          <Input
            id="projectName"
            label="Project Name"
            placeholder="e.g. Website Redesign"
            value={form.projectName}
            onChange={(e) =>
              setForm((p) => ({ ...p, projectName: e.target.value }))
            }
            required
          />
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={3}
              placeholder="What's this project about?"
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="startDate"
              label="Start Date"
              type="date"
              value={form.startDate}
              onChange={(e) =>
                setForm((p) => ({ ...p, startDate: e.target.value }))
              }
              required
            />
            <Input
              id="endDate"
              label="End Date"
              type="date"
              value={form.endDate}
              onChange={(e) =>
                setForm((p) => ({ ...p, endDate: e.target.value }))
              }
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((p) => ({ ...p, status: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {Object.values(PROJECT_STATUS).map((s) => (
                  <option key={s} value={s}>
                    {s.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={form.priority}
                onChange={(e) =>
                  setForm((p) => ({ ...p, priority: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {Object.values(PROJECT_PRIORITY).map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={submitting} className="flex-1">
              Create Project
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectsPage;
