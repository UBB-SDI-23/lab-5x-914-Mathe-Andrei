import {User} from "../models/User";
import {AuthContextType} from "../services/AuthProvider";

export function isOwner(context: AuthContextType, objUser: User): boolean {
	return context.userId === objUser.id;
}