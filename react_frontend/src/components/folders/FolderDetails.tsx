import {
    Box,
    Card,
    CardActions,
    CardContent,
    CircularProgress,
    Container,
    IconButton,
    List, ListItemButton, ListItemIcon, ListItemText,
    Typography
} from "@mui/material";
import {Link, useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {Folder} from "../../models/Folder";
import {ArrowBack} from "@mui/icons-material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import {FolderDelete} from "./FolderDelete";
import axios from "axios";
import {BACKEND_API_URL} from "../../constants";
import {User} from "../../models/User";
import ArticleIcon from "@mui/icons-material/Article";
import {useAuthContext} from "../../services/useAuthContext";
import {isAuthenticated} from "../../permissions/IsAuthenticated";
import {isOwner} from "../../permissions/IsOwner";
import {hasHigherRole} from "../../permissions/HasHigherRole";

export const FolderDetails = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const context = useAuthContext();

    const [loading, setLoading] = useState(true);
    const [folder, setFolder] = useState<Folder>();

    useEffect(() => {
        setLoading(true);
        axios.get(`${BACKEND_API_URL}/folder/${id}/`)
            .then((response) => {
                setFolder(response.data);
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
        if (wasDeleted)
            navigate(-1);
    };

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
                        <Typography variant={"h4"} align={"center"}>Folder Details</Typography>
                        <CardActions sx={{justifyContent: "space-between"}}>
                            <IconButton sx={{ mr: 3 }} onClick={() => navigate(-1)}>
                                <ArrowBack/>
                            </IconButton>
                            {isAuthenticated(context) && (isOwner(context, folder?.user as User) || hasHigherRole(context, folder?.user as User)) && (
                                <Box>
                                    <IconButton component={Link} sx={{mr: 1}} to={`/folder/${id}/edit`}>
                                        <EditIcon/>
                                    </IconButton>
                                    <IconButton onClick={handleDelete}>
                                        <DeleteForeverIcon sx={{color: "red"}}/>
                                    </IconButton>
                                </Box>
                            )}
                        </CardActions>
                        <CardContent>
                            <Typography paragraph={true} align={"left"}>Name: {folder?.name}</Typography>
                            <Typography paragraph={true} align={"left"}>
                                User:
                                <span> </span>
                                <Link to={`/user/${(folder?.user as User).id}/details`}>
                                    {folder?.user !== null ? (folder?.user as User).username : null}
                                </Link>
                            </Typography>
                            <Typography paragraph={true} align={"left"}>Parent folder: {folder?.parent_folder !== null ? (folder?.parent_folder as Folder).name : null}</Typography>
                            <Typography paragraph={true} align={"left"}>Created at: {folder?.created_at}</Typography>
                            <Typography paragraph={true} align={"left"}>Updated at: {folder?.updated_at}</Typography>
                            <Typography paragraph={true} align={"left"} sx={{mb: 0}}>Files:</Typography>
                            <List>
                                {folder?.files?.map((file) => (
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
                    <FolderDelete open={openDeleteDialog} folderId={id} onClose={handleOnClose}/>
                </>
            )}
        </Container>
    );
};