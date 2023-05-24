import {
	Box,
	Button,
	Card,
	CardActions,
	CardContent,
	CircularProgress,
	Container,
	FormControlLabel,
	FormGroup,
	IconButton,
	Switch,
	TextField
} from "@mui/material";
import React, {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {ArrowBack} from "@mui/icons-material";
import {User} from "../../models/User"
import {BACKEND_API_URL} from "../../constants";
import axios from "axios";
import {validate_birthday, validate_email, validate_password, validate_url} from "../../validators/validators";
import {useAuthContext} from "../../services/useAuthContext";
import {isOwner} from "../../permissions/IsOwner";
import {hasHigherRole} from "../../permissions/HasHigherRole";

export const UserEdit = () => {
	const {id} = useParams();
	const navigate = useNavigate();
	const context = useAuthContext();

	const [loading, setLoading] = useState(true);
	const [user, setUser] = useState<User>({
		id: NaN,
		username: "",
		email: "",
		password: "",
		role: "",
		personal_files: [],
		folders: [],
		shared_files: [],
		created_at: "",
		updated_at: "",
		profile: {
			bio: "",
			birthday: "",
			website: "",
			dark_mode: false,
			page_size: NaN
		}
	});
	const [errorUsername, setErrorUsername] = useState<string>("");
	const [errorEmail, setErrorEmail] = useState<string>("");
	const [errorPassword, setErrorPassword] = useState<string>("");
	const [errorBio, setErrorBio] = useState<string>("");
	const [errorBirthday, setErrorBirthday] = useState<string>("");
	const [errorWebsite, setErrorWebsite] = useState<string>("");
	const [errorPageSize, setErrorPageSize] = useState<string>("");

	useEffect(() => {
		setLoading(true);
		axios.get(`${BACKEND_API_URL}/user/${id}/`)
			.then((response) => {
				if (!isOwner(context, response.data) && !hasHigherRole(context, response.data)) {
					navigate("/unauthorized", {replace: true});
					return;
				}
				setUser(response.data);
				setLoading(false);
			})
			.catch((error) => {
				if (error.response && error.response.status === 404) {
					navigate("/notfound");
				}
				console.log(error);
			});
	}, []);

	const editUser = async (event: { preventDefault: () => void }) => {
		event.preventDefault();

		if (user.password === "") {
			delete user.password;
		}
		if (user.profile.birthday === null) {
			// @ts-ignore
			delete user.profile.birthday;
		}

		let error = false;

		if ("password" in user && !validate_password(user.password as string)) {
			setErrorPassword("Password is too weak. It must have:\n- at least 8 characters long\n- at least one uppercase letter\n- at least one lowercase letter\n - at least one digit\n- at least one symbol from !&$@#%()*+-/<=>?_^~");
			error = true;
		} else {
			setErrorPassword("");
		}

		if (!validate_email(user.email)) {
			setErrorEmail("Email is invalid!");
			error = true;
		} else {
			setErrorEmail("");
		}

		if ("birthday" in user.profile && !validate_birthday(user.profile.birthday)) {
			setErrorBirthday("Birthday is invalid!");
			error = true;
		} else {
			setErrorBirthday("");
		}

		if (user.profile.website !== "" && !validate_url(user.profile.website)) {
			setErrorWebsite("Website is invalid!");
			error = true;
		} else {
			setErrorWebsite("");
		}

		if (isNaN(user.profile.page_size)) {
			setErrorPageSize("Page size cannot be blank!");
			error = true;
		} else if (user.profile.page_size <= 0) {
			setErrorPageSize("Page size must be strictly positive!")
			error = true;
		} else {
			setErrorPageSize("");
		}

		if (error) {
			return;
		}

		try {
			await axios.patch(`${BACKEND_API_URL}/user/${id}/`, user);
			navigate(-1);
		} catch (error: any) {
			console.log(error);
			let data = error.response.data;
			setErrorUsername(("username" in data) ? data.username : "");
			setErrorEmail(("email" in data) ? data.email : "");
			setErrorPassword(("password" in data) ? data.password : "");
			setErrorBio(("bio" in data.profile) ? data.profile.bio : "");
			setErrorBirthday(("birthday" in data.profile) ? data.profile.birthday : "");
			setErrorWebsite(("website" in data.profile) ? data.profile.website : "");
			setErrorPageSize(("page_size" in data.profile) ? data.profile.page_size : "");
		}
	};

	return (
		<Container sx={{display: "flex", flexDirection: "column", alignItems: "center", mt: 3, mb: 3}}>
			{loading && (
				<Box>
					<CircularProgress sx={{mt: 3}}/>
				</Box>
			)}
			{!loading && (
				<Card sx={{width: "100%"}}>
					<CardActions>
						<IconButton sx={{mr: 3}} onClick={() => navigate(-1)}>
							<ArrowBack/>
						</IconButton>
					</CardActions>
					<CardContent>
						<form>
							<TextField
								id={"username"}
								label={"username"}
								defaultValue={user.username}
								variant={"outlined"}
								error={errorUsername !== ""}
								helperText={errorUsername !== "" && errorUsername}
								fullWidth
								sx={{mb: 2}}
								onChange={(event) => setUser({...user, username: event.target.value})}
							/>
							<TextField
								id={"email"}
								label={"email"}
								defaultValue={user.email}
								variant={"outlined"}
								error={errorEmail !== ""}
								helperText={errorEmail !== "" && errorEmail}
								fullWidth
								sx={{mb: 2}}
								onChange={(event) => setUser({...user, email: event.target.value})}
							/>
							<TextField
								id={"password"}
								label={"password"}
								defaultValue={user.password}
								variant={"outlined"}
								type={"password"}
								error={errorPassword !== ""}
								helperText={errorPassword !== "" && errorPassword}
								fullWidth
								inputProps={{maxLength: 128}}
								sx={{mb: 2}}
								onChange={(event) => setUser({...user, password: event.target.value})}
							/>
							<TextField
								id={"bio"}
								label={"bio"}
								variant={"outlined"}
								defaultValue={user.profile.bio}
								error={errorBio !== ""}
								helperText={errorBio !== "" && errorBio}
								multiline
								minRows={4}
								fullWidth
								inputProps={{maxLength: 2000}}
								sx={{mb: 2}}
								onChange={(event) => setUser({
									...user,
									profile: {...user.profile, bio: event.target.value}
								})}
							/>
							<TextField
								id={"birthday"}
								defaultValue={user.profile.birthday}
								variant={"outlined"}
								type={"date"}
								error={errorBirthday !== ""}
								helperText={errorBirthday !== "" && errorBirthday}
								fullWidth
								inputProps={{max: new Date().toISOString().split('T')[0]}}
								sx={{mb: 2}}
								onChange={(event) => setUser({
									...user,
									profile: {...user.profile, birthday: event.target.value}
								})}
							/>
							<TextField
								id={"website"}
								label={"website"}
								defaultValue={user.profile.website}
								variant={"outlined"}
								type={"url"}
								error={errorWebsite !== ""}
								helperText={errorWebsite !== "" && errorWebsite}
								fullWidth
								sx={{mb: 2}}
								onChange={(event) => setUser({
									...user,
									profile: {...user.profile, website: event.target.value}
								})}
							/>
							<FormGroup>
								<FormControlLabel
									control={
										<Switch
											checked={user.profile.dark_mode}
											onChange={(event) => setUser({
												...user,
												profile: {...user.profile, dark_mode: event.target.checked}
											})}
										/>}
									label="Dark mode"
									sx={{mb: 2}}
								/>
							</FormGroup>
							<TextField
								id={"page_size"}
								label={"page size"}
								defaultValue={user.profile.page_size}
								variant={"outlined"}
								type={"number"}
								error={errorPageSize !== ""}
								helperText={errorPageSize !== "" && errorPageSize}
								fullWidth
								sx={{mb: 2}}
								inputProps={{min: 0}}
								onInput={(event: any) => {
									event.target.value = event.target.value.replace(/[^\d]/g, '');
								}}
								onChange={(event) => setUser({
									...user,
									profile: {...user.profile, page_size: event.target.value !== "" ? parseInt(event.target.value) : 0}
								})}
							/>
						</form>
					</CardContent>
					<CardActions sx={{justifyContent: "flex-end"}}>
						<Button onClick={editUser}>Save</Button>
					</CardActions>
				</Card>
			)}
		</Container>
	);
};