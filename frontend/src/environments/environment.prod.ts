// Production config. Swapped in for environment.ts during a
// production build via the `fileReplacements` entry in angular.json.
// Relative — the reverse proxy (nginx) serves this app and forwards
// `/api/*` to the backend container, so frontend and backend share
// one origin in production and no absolute URL is needed.
export const environment = {
  production: true,
  apiUrl: '/api',
};
