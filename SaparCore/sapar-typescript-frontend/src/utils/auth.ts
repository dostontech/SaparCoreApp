import { jwtDecode } from "jwt-decode";

export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  if (token.startsWith("mock_") || token.startsWith("token_demo_") || token.startsWith("demo_")) {
    return false;
  }
  try {
    const decoded: { exp?: number } = jwtDecode(token);
    if (!decoded.exp) return false;
    return decoded.exp * 1000 < Date.now();
  } catch {
    return false;
  }
};
