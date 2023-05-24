import {AuthContextType} from "../services/AuthProvider";
import {Roles} from "../models/Roles";

export function isAdmin(context: AuthContextType): boolean {
	return context.userRole === Roles.ADMIN;
}