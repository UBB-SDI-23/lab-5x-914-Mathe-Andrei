import {Button, Card, CardActions, CardContent, Container, TextField} from "@mui/material";
import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import {BACKEND_API_URL} from "../../constants";

export const ConfirmRegistration = () => {
	const navigate = useNavigate();

	const [code, setCode] = useState<string>("");
	const [errorCode, setErrorCode] = useState<string>("");

	const handleConfirm = async () => {
		if (code === "") {
			setErrorCode("Code cannot be blank!");
			return;
		} else {
			setErrorCode("");
		}

		await axios.get(`${BACKEND_API_URL}/register/confirm/${code}/`)
			.then((response) => {
				console.log(response);
				navigate("/login");
			})
			.catch((error) => {
				console.log(error);
				let data = error.response.data;
				setErrorCode(("detail" in data) ? data.detail : "");
			});
	}

	return (
		<Container sx={{display: "flex", flexDirection: "column", alignItems: "center", mt: 3, mb: 3}}>
			<Card sx={{width: "100%"}}>
				<CardContent>
					<form>
						<TextField
							id={"code"}
							label={"code"}
							variant={"outlined"}
							error={errorCode !== ""}
							helperText={errorCode !== "" && errorCode}
							required
							fullWidth
							sx={{mb: 2}}
							onChange={(event) => setCode(event.target.value)}
						/>
					</form>
				</CardContent>
				<CardActions sx={{justifyContent: "flex-end"}}>
					<Button onClick={handleConfirm}>Confirm</Button>
				</CardActions>
			</Card>
		</Container>
	);
};