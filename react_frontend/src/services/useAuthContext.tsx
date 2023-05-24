import {useContext} from "react";
import {AuthContext, AuthContextType} from "./AuthProvider";

export const useAuthContext = (): AuthContextType => {
	return useContext(AuthContext) as AuthContextType;
}