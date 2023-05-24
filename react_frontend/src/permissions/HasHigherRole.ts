import {User} from "../models/User";
import {Roles} from "../models/Roles";
import {AuthContextType} from "../services/AuthProvider";

export function hasHigherRole(context: AuthContextType, objUser: User): boolean {
	if (context.userRole === Roles.ADMIN)
		return true;
	return context.userRole === Roles.MODERATOR && objUser.role === Roles.USER;
}