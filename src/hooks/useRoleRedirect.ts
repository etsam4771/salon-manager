import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { User } from "../types/auth";
import type { UserRole } from "../types/salon";


const roleRoutes: Record<UserRole, string> = {
  // super_admin: "/admin/me",
  super_admin: "/admin/onboard-finalize",
  owner: "/owner",
  manager: "/manager",
  staff: "/staff",
  stylist: "/stylist",
  receptionist: "/receptionist",
  global: "/admin"
};

const onboardFinalize = "/admin/onboard-finalize"

export const useRoleRedirect = (user: User | null) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    if (user.role === "super_admin") {
      navigate(onboardFinalize, { replace: true })
    }

    const route = roleRoutes[user.role];

    if (route) {
      navigate(route, { replace: true });
    }
  }, [user, navigate]);
};