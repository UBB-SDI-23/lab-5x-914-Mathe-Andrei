import {AppBar, Box, Button, Toolbar, Typography} from "@mui/material";
import {Link, useLocation} from "react-router-dom";
import React from "react";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import logo from "../assets/logo.png";
import {isAuthenticated} from "../permissions/IsAuthenticated";
import {useAuthContext} from "../services/useAuthContext";
import {isAdmin} from "../permissions/IsAdmin";

export const AppMenu = () => {
	const location = useLocation()
	const path = location.pathname;
	const context = useAuthContext();

	return (
		<Box>
			<AppBar position={"static"}>
				<Toolbar>
					<Button component={Link} to={"/"} disableRipple={true}>
						<img style={{width: "50px", marginRight: "10px"}} src={logo}
							 alt={"brainbox-logo"}/>
					</Button>
					<Typography variant={"h6"}>BrainBox</Typography>
					<Box sx={{display: "flex", width: "100%", justifyContent: "space-between"}}>
						<Box>
							<Button
								component={Link}
								to={"/users"}
								variant={path.startsWith("/users") ? "outlined" : "text"}
								color={"inherit"}
								sx={{ml: 3}}>
								Users
							</Button>
							<Button
								component={Link}
								to={"/folders"}
								variant={path.startsWith("/folders") ? "outlined" : "text"}
								color={"inherit"}
								sx={{ml: 3}}>
								Folders
							</Button>
							<Button
								component={Link}
								to={"/files"}
								variant={path.startsWith("/files") ? "outlined" : "text"}
								color={"inherit"}
								sx={{ml: 3}}>
								Files
							</Button>
							<Button
								component={Link}
								to={"/statistics"}
								variant={path.startsWith("/statistics") ? "outlined" : "text"}
								color={"inherit"}
								sx={{ml: 3}}>
								Statistics
							</Button>
							<Button
								component={Link}
								to={"/filters/users-by-created-date"}
								variant={path.startsWith("/filters/users-by-created-date") ? "outlined" : "text"}
								color={"inherit"}
								sx={{ml: 3}}>
								Filters
							</Button>
							{isAdmin(context) && (
								<Button
									component={Link}
									to={"/dashboard"}
									variant={path.startsWith("/dashboard") ? "outlined" : "text"}
									color={"inherit"}
									sx={{ml: 3}}>
									Dashboard
								</Button>
							)}
						</Box>
						<Box>
							{isAuthenticated(context) && (
								<>
									<Button
										component={Link}
										to={`/user/${context.userId}/details`}
										variant={path.startsWith(`/user/${context.userId}/details`) ? "outlined" : "text"}
										color={"inherit"}
										sx={{ml: 3}}
									>
										<AccountCircleIcon/>
										<Typography paragraph={true} sx={{mb: 0, ml: 1}}>Profile</Typography>
									</Button>
									<Button
										component={Link}
										to={"/login"}
										color={"inherit"}
										sx={{ml: 3}}
										onClick={() => context?.logout()}
									>
										Logout
									</Button>
								</>
							)}
							{!isAuthenticated(context) && (
								<>
									<Button
										component={Link}
										to={"/login"}
										variant={path.startsWith("/login") ? "outlined" : "text"}
										color={"inherit"}
										sx={{ml: 3}}>
										Login
									</Button>
									<Button
										component={Link}
										to={"/register"}
										variant={path.startsWith("/register") ? "outlined" : "text"}
										color={"inherit"}
										sx={{ml: 3}}>
										Register
									</Button>
								</>
							)}
						</Box>
					</Box>
				</Toolbar>
			</AppBar>
		</Box>
	);
};