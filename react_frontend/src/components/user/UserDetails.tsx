import {
    Box,
    Card, CardActions,
    CardContent,
    CircularProgress,
    Container,
    IconButton,
    List,
    ListItemButton,
    ListItemIcon, ListItemText,
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

export const UserDetails = () => {
    const {id} = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User>();

    useEffect(() => {
        setLoading(true);
        axios.get(`${BACKEND_API_URL}/user/${id}/`)
                .then((response) => {
                    setUser(response.data);
                    setLoading(false);
                })
                .catch((error) => console.log(error));
    }, []);

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    const handleDelete = () => {
        setOpenDeleteDialog(true);
    };

    const handleOnClose = (wasDeleted: boolean) => {
        setOpenDeleteDialog(false);
        if (wasDeleted)
            navigate(-1);
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
                    <Card>
                        <Typography variant={"h4"} align={"center"}>User Details</Typography>
                        <CardActions sx={{justifyContent: "space-between"}}>
                            <IconButton sx={{ mr: 3 }} onClick={() => navigate(-1)}>
                                <ArrowBack/>
                            </IconButton>
                            <Box>
                                <IconButton component={Link} sx={{mr: 1}} to={`/user/${id}/edit`}>
                                    <EditIcon/>
                                </IconButton>
                                <IconButton onClick={handleDelete}>
                                    <DeleteForeverIcon sx={{color: "red"}}/>
                                </IconButton>
                            </Box>
                        </CardActions>
                        <CardContent>
                            <Typography paragraph={true} align={"left"}>Username: {user?.username}</Typography>
                            <Typography paragraph={true} align={"left"}>Email: {user?.email}</Typography>
                            <Typography paragraph={true} align={"left"}>Password: {user?.password}</Typography>
                            <Typography paragraph={true} align={"left"}>Created at: {user?.created_at}</Typography>
                            <Typography paragraph={true} align={"left"}>Updated at: {user?.updated_at}</Typography>
                            <Typography paragraph={true} align={"left"}>Folders:</Typography>
                            <List>
                                {user?.folders?.map((folder) => (
                                    <ListItemButton component={Link} key={folder.id} sx={{ml: 3}} to={`/folder/${folder.id}/details`}>
                                        <ListItemIcon>
                                            <FolderIcon/>
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={folder.name}
                                        />
                                    </ListItemButton>
                                ))}
                            </List>
                            <Typography paragraph={true} align={"left"}>Shared files:</Typography>
                            <List>
                                {user?.shared_files.map((shared_file) => (
                                    <ListItemButton component={Link} key={(shared_file.file as File).id} sx={{ml: 3}} to={`/file/${(shared_file.file as File).id}/details`}>
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