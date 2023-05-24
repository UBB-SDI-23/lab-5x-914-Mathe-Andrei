import React, {useState} from "react";
import axios, {AxiosResponse} from "axios";
import jwt_decode from "jwt-decode";
import {BACKEND_API_URL} from "../constants";
import {Roles} from "../models/Roles";

export type AuthContextType = {
	authenticated: boolean;
	login: (response: AxiosResponse) => void;
	logout: () => void;
	checkAuth: () => void;
	userId: number;
	userRole: string;
}

export const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children}: any) => {
	const isAuth: boolean = checkAuth();

	const [userId, setUserId] = useState<number>(isAuth ? (jwt_decode(localStorage.getItem("access_token") as string) as any).user_id : NaN);
	const [userRole, setUserRole] = useState<string>(isAuth ? (jwt_decode(localStorage.getItem("access_token") as string) as any).user_role : "");
	const [authenticated, setAuthenticated] = useState<boolean>(isAuth);

	function login(response: AxiosResponse) {
		const accessTokenData = jwt_decode(response.data["access"]) as any;
		console.log(accessTokenData);

		localStorage.setItem("access_token", response.data["access"]);
		localStorage.setItem("refresh_token", response.data["refresh"]);

		setUserId(accessTokenData.user_id);
		setUserRole(accessTokenData.user_role);
		setAuthenticated(true);
	}

	function logout() {
		localStorage.removeItem("access_token");
		localStorage.removeItem("refresh_token");

		setUserId(NaN);
		setUserRole(Roles.GUEST);
		setAuthenticated(false);
	}

	function refreshLogin() {
		const refreshToken = localStorage.getItem("refresh_token");
		if (refreshToken === null) {
			throw new Error("Could not refresh login! Refresh token does not exist!");
		}

		const refreshTokenData = jwt_decode(refreshToken) as any;
		const dateNow = new Date()
		if (refreshTokenData.exp <= dateNow.getTime() / 1000) {
			throw new Error("Could not refresh login! Refresh token has expired!");
		}

		const request = new XMLHttpRequest();
		request.open("POST", `${BACKEND_API_URL}/login/refresh/`, false);
		request.setRequestHeader("content-type", "application/json")
		request.send(JSON.stringify({"refresh": refreshToken}));

		const response = JSON.parse(request.responseText);
		if (request.status === 200) {
			localStorage.setItem("access_token", response["access"]);
		} else {
			throw new Error("Error occurred while requesting a new access token: " + response);
		}
	}

	function checkAuth(): boolean {
		try {
			const accessToken = localStorage.getItem("access_token");
			if (accessToken === null) {
				refreshLogin();
				return true;
			}

			const accessTokenData = jwt_decode(accessToken) as any;
			const dateNow = new Date();
			if (accessTokenData.exp <= dateNow.getTime() / 1000) {
				refreshLogin();
				return true;
			}

			return true;
		} catch (error) {
			return false;
		}
	}

	axios.interceptors.request.use((config) => {
		if (config.url && (config.url.includes("login") || config.url.includes("register"))) {
			return config;
		}

		if (!checkAuth() && userRole !== Roles.GUEST) {
			logout();
			throw new Error("Login session expired!");
		}

		if (userRole !== Roles.GUEST) {
			config.headers["Authorization"] = "Bearer " + localStorage.getItem("access_token");
		}

		return config;
	}, (error) => {
		return Promise.reject(error);
	});

	const contextData: AuthContextType = {
		authenticated: authenticated,
		login: login,
		logout: logout,
		checkAuth: checkAuth,
		userId: userId,
		userRole: userRole
	};

	return (
		<AuthContext.Provider value={contextData}>
			{children}
		</AuthContext.Provider>
	);
};