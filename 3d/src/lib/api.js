const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

const buildUrl = (path) => `${API_BASE_URL}${path}`;

const parseJson = async (response) => {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return null;
};

const request = async (path, options = {}) => {
  let response;

  try {
    response = await fetch(buildUrl(path), {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch {
    const error = new Error(
      "Cannot reach the backend server. Start the project with npm run dev or check the deployed API."
    );
    error.details = {};
    throw error;
  }

  const data = await parseJson(response);

  if (!response.ok) {
    const error = new Error(data?.message || "Request failed.");
    error.details = data?.errors || {};
    throw error;
  }

  return data;
};

export const fetchPortfolio = () => request("/api/portfolio");

export const fetchHealth = () => request("/api/health");

export const submitContactMessage = (payload) =>
  request("/api/contact", {
    method: "POST",
    body: JSON.stringify(payload),
  });
