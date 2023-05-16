import {
    Box, Button,
    Card,
    CardActions,
    CardContent,
    CircularProgress,
    Container,
    IconButton,
    List, ListItemButton, ListItemIcon, ListItemText, Paper,
    Typography
} from "@mui/material";
import {Link, useNavigate, useParams} from "react-router-dom";
import React, {useContext, useEffect, useState} from "react";
import {File} from "../../models/File";
import {AccountCircle, ArrowBack} from "@mui/icons-material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import {FileDelete} from "./FileDelete";
import axios from "axios";
import {BACKEND_API_URL} from "../../constants";
import {User} from "../../models/User";
import {Folder} from "../../models/Folder";
import {FileShare} from "./FileShare";
import {AuthContext} from "../../services/AuthProvider";

export const FileDetails = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const context = useContext(AuthContext);

    useEffect(() => {
        if (!context?.authenticated) {
            navigate('/login', {replace: true});
        }
    }, [context?.authenticated]);

    const [loading, setLoading] = useState(true);
    const [file, setFile] = useState<File>();
    const [refreshUser, setRefreshUser] = useState<boolean>(false);

    useEffect(() => {
        setLoading(true);
        setRefreshUser(false);
        axios.get(`${BACKEND_API_URL}/file/${id}/`)
            .then((response) => {
                setFile(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.log(error);
            });
    }, [refreshUser]);

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [openShareDialog, setOpenShareDialog] = useState(false);

    const handleDelete = () => {
        setOpenDeleteDialog(true);
    };

    const handleDeleteOnClose = (wasDeleted: boolean) => {
        setOpenDeleteDialog(false);
        if (wasDeleted)
            navigate(-1);
    };

    const handleShare = () => {
        setOpenShareDialog(true);
    };

    const handleShareOnClose = (wasShared: boolean) => {
        setOpenShareDialog(false);
        if (wasShared)
            setRefreshUser(true);
    };

    const deleteSharedUser = async (userId: number) => {
        await axios.delete(`${BACKEND_API_URL}/file/${file?.id}/shared-user/${userId}`)
            .then((response) => console.log(response))
            .catch((error) => {
                console.log(error);
            })
        setRefreshUser(true);
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
                    <Card>
                        <Typography variant={"h4"} align={"center"}>File Details</Typography>
                        <CardActions sx={{justifyContent: "space-between"}}>
                            <IconButton sx={{ mr: 3 }} onClick={() => navigate(-1)}>
                                <ArrowBack/>
                            </IconButton>
                            <Box>
                                <IconButton component={Link} sx={{mr: 1}} to={`/file/${id}/edit`}>
                                    <EditIcon/>
                                </IconButton>
                                <IconButton onClick={handleDelete}>
                                    <DeleteForeverIcon sx={{color: "red"}}/>
                                </IconButton>
                            </Box>
                        </CardActions>
                        <CardContent>
                            <Typography paragraph={true} align={"left"}>Name: {file?.name}</Typography>
                            <Typography paragraph={true} align={"left"}>
                                User:
                                <span> </span>
                                <Link to={`/user/${(file?.user as User).id}/details`}>
                                    {file?.user !== null ? (file?.user as User).username : null}
                                </Link>
                            </Typography>
                            <Typography paragraph={true} align={"left"}>Folder: {file?.folder !== null ? (file?.folder as Folder).name : null}</Typography>
                            <Typography paragraph={true} align={"left"}>Content:</Typography>
                            <Paper elevation={1} sx={{p: 3, background: "#f4f4f4"}}>
                                <Typography paragraph={true} sx={{wordBreak: "normal", overflowWrap: "anywhere", whiteSpace: "pre-line"}}>{file?.content}</Typography>
                            </Paper>
                            <br/>
                            <Typography paragraph={true} align={"left"}>Created at: {file?.created_at}</Typography>
                            <Typography paragraph={true} align={"left"}>Updated at: {file?.updated_at}</Typography>
                            <Typography paragraph={true} align={"left"} sx={{mb: 0}}>Shared users:</Typography>
                            <List>
                                {file?.shared_users.map((shared_user) => (
                                    <Box key={(shared_user.user as User).id} display={"flex"}>
                                        <ListItemButton component={Link} sx={{ml: 3}} to={`/user/${(shared_user.user as User).id}/details`}>
                                            <ListItemIcon>
                                                <AccountCircle/>
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={(shared_user.user as User).username}
                                            />
                                        </ListItemButton>
                                        <IconButton sx={{borderRadius: 0}} onClick={(event) => {
                                            deleteSharedUser((shared_user.user as User).id);
                                        }}>
                                            <DeleteForeverIcon sx={{color: "red"}}/>
                                        </IconButton>
                                    </Box>
                                ))}
                            </List>
                        </CardContent>
                        <CardActions sx={{justifyContent: "flex-end"}}>
                            <Button variant={"text"} onClick={handleShare}>Share</Button>
                        </CardActions>
                    </Card>
                    <FileDelete open={openDeleteDialog} fileId={id} onClose={handleDeleteOnClose}/>
                    <FileShare open={openShareDialog} file={file as File} onClose={handleShareOnClose}/>
                </>
            )}
        </Container>
    );
};