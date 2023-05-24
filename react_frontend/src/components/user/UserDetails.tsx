import {
	Box,
	Card, CardActions,
	CardContent,
	CircularProgress,
	Container,
	IconButton,
	List,
	ListItemButton,
	ListItemIcon, ListItemText, Paper,
	Typography
} from "@mui/material";
import {Link, useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {User} from "../../models/User";
import axios from "axios";
import {BACKEND_API_URL} from "../../constants";
import {ArrowBack} from "@mui/icons-material";
import FolderIcon from "@mui/icons-material/Folder"
import ArticleIcon from '@mui/icons-material/Article';
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import {UserDelete} from "./UserDelete";
import {File} from "../../models/File";
import {useAuthContext} from "../../services/useAuthContext";
import { isAuthenticated } from "../../permissions/IsAuthenticated";
import {isOwner} from "../../permissions/IsOwner";
import {hasHigherRole} from "../../permissions/HasHigherRole";

export const UserDetails = () => {
	const {id} = useParams();
	const navigate = useNavigate();
	const context = useAuthContext();

	const [loading, setLoading] = useState(true);
	const [user, setUser] = useState<User>();

	useEffect(() => {
		setLoading(true);
		axios.get(`${BACKEND_API_URL}/user/${id}/`)
			.then((response) => {
				console.log(response);
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

	const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

	const handleDelete = () => {
		setOpenDeleteDialog(true);
	};

	const handleOnClose = (wasDeleted: boolean) => {
		setOpenDeleteDialog(false);
		if (wasDeleted) {
			if (context.userId === user?.id) {
				context.logout();
				navigate("/login");
				return;
			}
			navigate(-1);
		}
	};

	// @ts-ignore
	return (
		<Container sx={{display: "flex", flexDirection: "column", alignItems: "center", mt: 3, mb: 3}}>
			{loading && (
				<Box>
					<CircularProgress sx={{mt: 3}}/>
				</Box>
			)}
			{!loading && (
				<>
					<Card sx={{width: "100%"}}>
						<Typography variant={"h4"} align={"center"}>User Details</Typography>
						<CardActions sx={{justifyContent: "space-between"}}>
							<IconButton sx={{mr: 3}} onClick={() => navigate(-1)}>
								<ArrowBack/>
							</IconButton>
							{isAuthenticated(context) && (isOwner(context, user as User) || hasHigherRole(context, user as User)) && (
								<Box>
									<IconButton component={Link} sx={{mr: 1}} to={`/user/${id}/edit`}>
										<EditIcon/>
									</IconButton>
									<IconButton onClick={handleDelete}>
										<DeleteForeverIcon sx={{color: "red"}}/>
									</IconButton>
								</Box>
							)}
						</CardActions>
						<CardContent>
							<Typography paragraph={true} align={"left"}>Username: {user?.username}</Typography>
							<Typography paragraph={true} align={"left"}>Email: {user?.email}</Typography>
							<Typography paragraph={true} align={"left"}>Role: {user?.role}</Typography>
							<Typography paragraph={true} align={"left"}>Bio:</Typography>
							<Paper elevation={1} sx={{p: 3, background: "#f4f4f4"}}>
								<Typography paragraph={true} sx={{
									wordBreak: "normal",
									overflowWrap: "anywhere",
									whiteSpace: "pre-line"
								}}>{user?.profile.bio}</Typography>
							</Paper>
							<br/>
							<Typography paragraph={true} align={"left"}>Birthday: {user?.profile.birthday}</Typography>
							<Typography paragraph={true} align={"left"}>Website: {user?.profile.website}</Typography>
							<Typography paragraph={true} align={"left"}>Dark
								mode: {user?.profile.dark_mode ? "on" : "off"}</Typography>
							<Typography paragraph={true} align={"left"}>Page
								size: {user?.profile.page_size}</Typography>
							<Typography paragraph={true} align={"left"}>Created at: {user?.created_at}</Typography>
							<Typography paragraph={true} align={"left"}>Updated at: {user?.updated_at}</Typography>
							<Typography paragraph={true} align={"left"} sx={{mb: 0}}>Files ({user?.personal_files.length}):</Typography>
							<List>
								{user?.personal_files.map((file) => (
									<ListItemButton component={Link} key={file.id} sx={{ml: 3}}
													to={`/file/${file.id}/details`}>
										<ListItemIcon>
											<ArticleIcon/>
										</ListItemIcon>
										<ListItemText
											primary={file.name}
										/>
									</ListItemButton>
								))}
							</List>
							<Typography paragraph={true} align={"left"} sx={{mb: 0}}>Folders ({user?.folders.length}):</Typography>
							<List>
								{user?.folders.map((folder) => (
									<ListItemButton component={Link} key={folder.id} sx={{ml: 3}}
													to={`/folder/${folder.id}/details`}>
										<ListItemIcon>
											<FolderIcon/>
										</ListItemIcon>
										<ListItemText
											primary={folder.name}
										/>
									</ListItemButton>
								))}
							</List>
							<Typography paragraph={true} align={"left"} sx={{mb: 0}}>Shared files ({user?.shared_files.length}):</Typography>
							<List>
								{user?.shared_files.map((shared_file) => (
									<ListItemButton component={Link} key={(shared_file.file as File).id} sx={{ml: 3}}
													to={`/file/${(shared_file.file as File).id}/details`}>
										<ListItemIcon>
											<ArticleIcon/>
										</ListItemIcon>
										<ListItemText
											primary={(shared_file.file as File).name}
										/>
									</ListItemButton>
								))}
							</List>
						</CardContent>
					</Card>
					<UserDelete open={openDeleteDialog} userId={id} onClose={handleOnClose}/>
				</>
			)}
		</Container>
	);
};