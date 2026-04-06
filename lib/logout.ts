export async function logoutDemoSession() {
  const response = await fetch("/api/auth/demo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "logout" })
  });

  if (!response.ok) {
    throw new Error("Unable to logout demo session.");
  }
}
