import {useContext} from "react";
import {AuthContext, AuthContextType} from "./AuthProvider";
import {Navigate, Outlet, useLocation} from "react-router-dom";

interface Props {
	allowedRoles: string[];
}

export const Authorization = ({allowedRoles}: Props) => {
	const context = useContext(AuthContext) as AuthContextType;
	const location = useLocation();

	if (allowedRoles.includes(context.userRole)) {
		return <Outlet/>
	}

	if (context?.authenticated) {
		if (location.pathname.includes("/login") || location.pathname.includes("/register")) {
			return <Navigate to={"/"} replace/>
		}
		return <Navigate to={"/unauthorized"} replace/>
	}

	return <Navigate to={"/login"} replace/>
};