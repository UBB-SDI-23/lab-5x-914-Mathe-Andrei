import {Button, Card, CardActions, CardContent, Container, TextField} from "@mui/material";
import React, {useContext, useEffect, useState} from "react";
import axios from "axios";
import {BACKEND_API_URL} from "../../constants";
import {useNavigate} from "react-router-dom";
import {AuthContext, AuthContextType} from "../../services/AuthProvider";
import {validate_birthday, validate_email, validate_password, validate_url} from "../../validators/validators";

export const Login = () => {
	const navigate = useNavigate();
	const context = useContext(AuthContext) as AuthContextType;

	useEffect(() => {
		if (context?.authenticated) {
			navigate('/', {replace: true});
		}
	}, [context?.authenticated]);

	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [errorEmail, setErrorEmail] = useState<string>("");
	const [errorPassword, setErrorPassword] = useState<string>("");

	const handleLogin = async () => {
		let error = false;

		if (!validate_password(password as string)) {
			setErrorPassword("Password is too weak. It must have:\n- at least 8 characters long\n- at least one uppercase letter\n- at least one lowercase letter\n - at least one digit\n- at least one symbol from !&$@#%()*+-/<=>?_^~");
			error = true;
		} else {
			setErrorPassword("");
		}

		if (!validate_email(email)) {
			setErrorEmail("Email is invalid!");
			error = true;
		} else {
			setErrorEmail("");
		}

		if (error) {
			return;
		}

		await axios.post(`${BACKEND_API_URL}/login/`, {
			"email": email,
			"password": password
		})
			.then((response) => {
				console.log(response);
				context.login(response);
				navigate("/");
			})
			.catch((error) => {
				console.log(error);
				let data = error.response.data;
				setErrorEmail(("email" in data) ? data.email : "");
				setErrorPassword(("password" in data) ? data.password : "");
			});
	}

	return (
		<Container sx={{display: "flex", flexDirection: "column", alignItems: "center", mt: 3, mb: 3}}>
			<Card sx={{width: "100%"}}>
				<CardContent>
					<form>
						<TextField
							id={"email"}
							label={"email"}
							variant={"outlined"}
							error={errorEmail !== ""}
							helperText={errorEmail !== "" && errorEmail}
							required
							fullWidth
							sx={{mb: 2}}
							onChange={(event) => setEmail(event.target.value)}
						/>
						<TextField
							id={"password"}
							label={"password"}
							type={"password"}
							variant={"outlined"}
							error={errorPassword !== ""}
							helperText={errorPassword !== "" && errorPassword}
							required
							fullWidth
							sx={{mb: 2}}
							onChange={(event) => setPassword(event.target.value)}
						/>
					</form>
				</CardContent>
				<CardActions sx={{justifyContent: "flex-end"}}>
					<Button onClick={handleLogin}>Login</Button>
				</CardActions>
			</Card>
		</Container>
	);
};