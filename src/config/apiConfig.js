export const apiConfig = {
  baseUrl: "http://localhost:5001",

  AuthController: {
    register: {
      method: "POST",
      endpoint: "/auth/register"
    },
    login: {
      method: "POST",
      endpoint: "/auth/login"
    },
    refresh: {
      method: "POST",
      endpoint: "/auth/refresh"
    },
    logout: {
      method: "POST",
      endpoint: "/auth/logout"
    },
    me: {
      method: "GET",
      endpoint: "/auth/me"
    },
    googleStart: {
      method: "GET",
      endpoint: "/auth/google/start"
    },
    googleCallback: {
      method: "GET",
      endpoint: "/auth/google/callback"
    },
    githubStart: {
      method: "GET",
      endpoint: "/auth/github/start"
    },
    githubCallback: {
      method: "GET",
      endpoint: "/auth/github/callback"
    }
  },

  UsersController: {
    me: {
      method: "GET",
      endpoint: "/users/me"
    }
  },

  TemplatesController: {
    list: {
      method: "GET",
      endpoint: "/templates"
    },
    getById: {
      method: "GET",
      endpoint: "/templates/:id"
    },
    create: {
      method: "POST",
      endpoint: "/templates"
    },
    update: {
      method: "PATCH",
      endpoint: "/templates/:id"
    },
    delete: {
      method: "DELETE",
      endpoint: "/templates/:id"
    },
    duplicate: {
      method: "POST",
      endpoint: "/templates/:id/duplicate"
    },
    import: {
      method: "POST",
      endpoint: "/templates/import"
    },
    export: {
      method: "GET",
      endpoint: "/templates/:id/export"
    }
  },

  TemplatePresetsController: {
    list: {
      method: "GET",
      endpoint: "/template-presets"
    },
    getByKey: {
      method: "GET",
      endpoint: "/template-presets/:key"
    }
  },

  AssetsController: {
    uploadLogo: {
      method: "POST",
      endpoint: "/assets/logo"
    },
    getById: {
      method: "GET",
      endpoint: "/assets/:id"
    },
    delete: {
      method: "DELETE",
      endpoint: "/assets/:id"
    }
  },

  ExportsController: {
    getById: {
      method: "GET",
      endpoint: "/exports/:id"
    }
  }
};
