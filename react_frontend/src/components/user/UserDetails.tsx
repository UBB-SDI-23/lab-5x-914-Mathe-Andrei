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
import {SharedFile} from "../../models/SharedFile";
import {File} from "../../models/File"
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import {UserDelete} from "./UserDelete";

export const UserDetails = () => {
    const {id} = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<User>();
    const [sharedFiles, setSharedFiles] = useState<File[]>([]);

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    useEffect(() => {
        setLoading(true);

        const fetchUser = async () => {
            await axios.get(`${BACKEND_API_URL}/user/${id}/`)
                .then((response) => {
                    setUser(response.data);

                    const promises = response.data.shared_files?.map((shared_file: SharedFile) => {
                        return axios.get(`${BACKEND_API_URL}/file/${shared_file.file}/`)
                            .then((response) => response.data)
                            .catch((error) => console.log(error));
                    });

                    Promise.all(promises).then((responses) => setSharedFiles(responses));

                    setLoading(false);
                })
                .catch((error) => console.log(error));
        };
        fetchUser();
    }, [id]);

    const handleDelete = () => {
        setOpenDeleteDialog(true);
    }

    const handleOnClose = (wasDeleted: boolean) => {
        setOpenDeleteDialog(false);
        if (wasDeleted)
            navigate(-1);
    }

    return (
        <Container sx={{display: "flex", flexDirection: "column", alignItems: "center", mt: 3}}>
            {loading && <CircularProgress/>}
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
                                {sharedFiles.map((file: File) => (
                                    <ListItemButton component={Link} key={file.id} sx={{ml: 3}} to={`/file/${file.id}/details`}>
                                        <ListItemIcon>
                                            <ArticleIcon/>
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={file.name}
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