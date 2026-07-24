export const http = {
  get: () => {},
  post: () => {},
  put: () => {},
  delete: () => {},
};

export const HttpResponse = {
  json: () => ({}),
  text: () => "",
};

export const delay = () => Promise.resolve();

export const setupWorker = () => ({
  start: () => Promise.resolve(),
  stop: () => {},
  use: () => {},
  resetHandlers: () => {},
});
