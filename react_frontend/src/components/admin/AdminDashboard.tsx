import {
	Autocomplete, Box,
	Button,
	Card,
	CardActions,
	CardContent,
	Container,
	FormControl, InputLabel, LinearProgress, MenuItem, Select,
	TextField,
	Typography
} from "@mui/material";
import React, {useCallback, useEffect, useState} from "react";
import axios from "axios";
import {BACKEND_API_URL} from "../../constants";
import {User} from "../../models/User";
import {debounce} from "lodash";
import {Roles} from "../../models/Roles";

export const AdminDashboard = () => {
	const [loading, setLoading] = useState<boolean>(false);
	const [pageSize, setPageSize] = useState<number>(0);
	const [errorPageSize, setErrorPageSize] = useState<string>("")

	const editPageSize = () => {
		let errors: boolean = false;

		if (isNaN(pageSize)) {
			setErrorPageSize("Page size cannot be blank!");
			errors = true;
		} else if (pageSize < 0) {
			setErrorPageSize("Page size must be strictly positive!");
			errors = true;
		} else {
			setErrorPageSize("");
		}

		if (errors)
			return

		setLoading(true);
		axios.put(`${BACKEND_API_URL}/users/page-size/`, {"page_size": pageSize})
			.then((response) => {
				console.log(response);
				setLoading(false);
			})
			.catch((error) => {
				console.log(error);
				setLoading(false);
			});
	};

	const [userId, setUserId] = useState<number>(NaN);
	const [role, setRole] = useState<string>(Roles.USER);
	const [users, setUsers] = useState<User[]>([]);
	// @ts-ignore
	let roles = Object.values(Roles);
	roles.shift();

	const fetchUsers = async (query: string) => {
		try {
			const response = await axios.get(`${BACKEND_API_URL}/users?page_size=10&username=${query}`);
			let data = await response.data.results;
			setUsers(data);
		} catch (error: any) {
			console.log("Error fetching users: ", error);
		}
	};

	const debounceFetchUsers = useCallback(debounce(fetchUsers, 250), []);

	useEffect(() => {
		return () => {
			debounceFetchUsers.cancel();
		};
	}, [debounceFetchUsers]);

	const editRole = () => {
		setLoading(true);
		axios.put(`${BACKEND_API_URL}/user/${userId}/role/`, {'role': role})
			.then((response) => {
				console.log(response)
				setLoading(false);
			})
			.catch((error) => {
				console.log(error)
				setLoading(false);
			});
	};

	const deleteFolders = () => {
		setLoading(true);
		axios.delete(`${BACKEND_API_URL}/folders/`)
			.then((response) => {
				console.log(response);
				setLoading(false);
			})
			.catch((error) => {
				console.log(error);
				setLoading(false);
			});
	};

	const deleteFiles = () => {
		setLoading(true);
		axios.delete(`${BACKEND_API_URL}/files/`)
			.then((response) => {
				console.log(response);
				setLoading(false);
			})
			.catch((error) => {
				console.log(error);
				setLoading(false);
			});
	};

	const deleteSharedFiles = () => {
		setLoading(true);
		axios.delete(`${BACKEND_API_URL}/sharedfiles/`)
			.then((response) => {
				console.log(response);
				setLoading(false);
			})
			.catch((error) => {
				console.log(error);
				setLoading(false);
			});
	};

	const populateFolders = () => {
		setLoading(true);
		axios.post(`${BACKEND_API_URL}/populate/folders/`)
			.then((response) => {
				console.log(response);
				setLoading(false);
			})
			.catch((error) => {
				console.log(error);
				setLoading(false);
			});
	};

	const populateFiles = () => {
		setLoading(true);
		axios.post(`${BACKEND_API_URL}/populate/files/`)
			.then((response) => {
				console.log(response);
				setLoading(false);
			})
			.catch((error) => {
				console.log(error);
				setLoading(false);
			});
	};

	const populateSharedFiles = () => {
		setLoading(true);
		axios.post(`${BACKEND_API_URL}/populate/sharedfiles/`)
			.then((response) => {
				console.log(response);
				setLoading(false);
			})
			.catch((error) => {
				console.log(error);
				setLoading(false);
			});
	};

	return (
		<Container sx={{display: "flex", flexDirection: "column", alignItems: "center", mt: 3, mb: 3, gap: 5}}>
			{loading && (
				<Box sx={{ width: '100%' }}>
					<LinearProgress sx={{mt: 3}}/>
				</Box>
			)}
			<Card sx={{width: "100%"}}>
				<Typography variant={"h4"} align={"center"}>Page Size</Typography>
				<CardContent>
					<form>
						<TextField
							id={"page_size"}
							label={"page size"}
							defaultValue={pageSize.toString()}
							variant={"outlined"}
							error={errorPageSize !== ""}
							helperText={errorPageSize !== "" && errorPageSize}
							disabled={loading}
							required
							fullWidth
							sx={{mb: 2}}
							onChange={(event) => setPageSize(parseInt(event.target.value))}
						/>
					</form>
				</CardContent>
				<CardActions sx={{justifyContent: "flex-end"}}>
					<Button disabled={loading} onClick={editPageSize}>Save</Button>
				</CardActions>
			</Card>
			<Card sx={{width: "100%"}}>
				<Typography variant={"h4"} align={"center"}>Role</Typography>
				<CardContent
					sx={{display: "flex", justifyContent: "space-between", gap: 2, overflow: "visible", mt: 1, pb: 0}}>
					<Autocomplete
						id={"user"}
						sx={{mb: 2, flexGrow: 5}}
						disabled={loading}
						options={users}
						getOptionLabel={(option) => `${option.username} - ${option.email}`}
						renderInput={(params) => (
							<TextField
								{...params}
								label={"user"}
								variant={"outlined"}
								required
							/>
						)}
						onInputChange={(event, value, reason) => {
							if (reason === "input") {
								if (value === "")
									setUserId(NaN);
								debounceFetchUsers(value);
							}
						}}
						onChange={(event, value) => {
							if (value) {
								setUserId(value.id);
							} else {
								setUserId(NaN);
							}
						}}
					/>
					<FormControl sx={{flexGrow: 1}}>
						<InputLabel id={"role-label"}>role</InputLabel>
						<Select
							id={"role"}
							labelId={"role-label"}
							label={"role"}
							value={role}
							disabled={loading}
							onChange={(event) => {
								setRole(event.target.value);
							}}
						>
							{roles.map((role) => (
								<MenuItem key={role} value={role}>{role}</MenuItem>
							))}
						</Select>
					</FormControl>
				</CardContent>
				<CardActions sx={{justifyContent: "flex-end"}}>
					<Button disabled={loading} onClick={editRole}>Save</Button>
				</CardActions>
			</Card>
			<Box sx={{width: "100%", display: "flex", justifyContent: "space-between", gap: 5}}>
				<Card sx={{width: "100%"}}>
					<Typography variant={"h4"} align={"center"}>Delete Entities</Typography>
					<CardContent sx={{display: "flex", flexDirection: "column", gap: 2}}>
						<Button variant={"contained"} disabled={loading} onClick={deleteFolders}>Delete Folders</Button>
						<Button variant={"contained"} disabled={loading} onClick={deleteFiles}>Delete Files</Button>
						<Button variant={"contained"} disabled={loading} onClick={deleteSharedFiles}>Delete Shared Files</Button>
					</CardContent>
				</Card>
				<Card sx={{width: "100%"}}>
					<Typography variant={"h4"} align={"center"}>Populate Entities</Typography>
					<CardContent sx={{display: "flex", flexDirection: "column", gap: 2}}>
						<Button variant={"contained"} disabled={loading} onClick={populateFolders}>Populate Folders</Button>
						<Button variant={"contained"} disabled={loading} onClick={populateFiles}>Populate Files</Button>
						<Button variant={"contained"} disabled={loading} onClick={populateSharedFiles}>Populate Shared Files</Button>
					</CardContent>
				</Card>
			</Box>
		</Container>
	);
};