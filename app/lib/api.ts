const baseURL = "https://energized-fireworks-cc618580b1.strapiapp.com"; // adjust to your API URL

export const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();

  const res = await fetch(`${baseURL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}
