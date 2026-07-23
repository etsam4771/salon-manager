const VERSION = "V1";
const PREFIX = `/api/${VERSION}`;

export const apiEndpoints = Object.freeze({
  version: VERSION,
  prefix: PREFIX,
  home: {
    contact: {
      store: "/contact",
    },
    list: "/contact",
    create: `/contact/create`,
  },
  auth: {
    login: "/login",
    register: "/register",
    forgotPassword: "/change-password",
    refreshAceess: "/refresh-token",
    logout: "logout",
  },
  user: {
    get: "/current-user",
    profile: `/user/profile`,
    getById: (id: string) => `/user/${id}`,
  },
} as const);
