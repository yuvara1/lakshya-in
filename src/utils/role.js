import { ROLES } from "./constants";

export const isSuperAdmin = (user) => user?.role === ROLES.SUPER_ADMIN;
export const isAdmin = (user) =>
  user?.role === ROLES.ADMIN || isSuperAdmin(user);
export const isManager = (user) =>
  user?.role === ROLES.MANAGER || isAdmin(user);
export const isEmployee = (user) => !!user;

export const canManageUsers = (user) => isAdmin(user);
export const canManageProjects = (user) => isManager(user);
export const canManageTasks = (user) => isManager(user);
export const canViewBilling = (user) => isAdmin(user);
export const canAccessSuperAdmin = (user) => isSuperAdmin(user);

export const getRoleLabel = (role) => {
  const labels = {
    [ROLES.SUPER_ADMIN]: "Super Admin",
    [ROLES.ADMIN]: "Admin",
    [ROLES.MANAGER]: "Manager",
    [ROLES.EMPLOYEE]: "Employee",
  };
  return labels[role] || role;
};
