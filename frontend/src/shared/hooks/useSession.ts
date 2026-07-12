export interface SessionUser {
  id: string;
  email: string;
  role: "Fleet Manager" | "Dispatcher" | "Safety Officer" | "Financial Analyst";
  name: string;
}

export function useSession() {
  const user: SessionUser = {
    id: "user_mock_01",
    email: "alex.mercer@transitops.com",
    role: "Financial Analyst",
    name: "Alex Mercer",
  };

  return {
    user,
    session: { access_token: "mock-jwt-token" },
    loading: false,
    isAuthenticated: true,
  };
}
