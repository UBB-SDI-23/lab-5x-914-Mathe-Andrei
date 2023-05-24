import {AuthContextType} from "../services/AuthProvider";

export function isAuthenticated(context: AuthContextType): boolean {
	return context.authenticated;
}