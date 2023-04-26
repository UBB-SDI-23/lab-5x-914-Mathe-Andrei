import {
    Autocomplete,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CircularProgress,
    Container,
    IconButton,
    TextField
} from "@mui/material";
import React, {useCallback, useEffect, useState} from "react";
import {ArrowBack} from "@mui/icons-material";
import {useNavigate, useParams} from "react-router-dom";
import { File } from "../../models/File";
import axios from "axios";
import {BACKEND_API_URL} from "../../constants";
import {Folder} from "../../models/Folder";
import {User} from "../../models/User";
import {debounce} from "lodash";

export const FileEdit = () => {
    const {id} = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [file, setFile] = useState<File>({
        id: NaN,
        name: "",
        content: "",
        user: NaN,
        folder: NaN,
        shared_users: [],
        created_at: "",
        updated_at: ""
    });
    const [selectedFolder, setSelectedFolder] = useState<null | Folder>(null);


    useEffect(() => {
        setLoading(true);
        axios.get(`${BACKEND_API_URL}/file/${id}/`)
            .then((response) => {
                setFile(response.data);
                setSelectedFolder(response.data.folder);
                setLoading(false);
            })
            .catch((error) => console.log(error));
    }, []);

    const editFile = async (event: {preventDefault: () => void}) => {
        event.preventDefault();
        if (typeof file.user !== "number")
            file.user = file.user.id;
        if (typeof file.folder !== "number" && file.folder !== null)
            file.folder = file.folder.id;
        try {
            await axios.patch(`${BACKEND_API_URL}/file/${id}/`, file);
            navigate(-1);
        } catch (error) {
            console.log(error);
        }
    };

    const [folders, setFolders] = useState<Folder[]>([]);

    const fetchFolders = async (query: string) => {
        try {
            const response = await axios.get<Folder[]>(`${BACKEND_API_URL}/folders?page=1&name=${query}&username=${(file.user as User).username}`);
            const data = await response.data;
            setFolders(data);
        } catch (error) {
            console.log("Error fetching folders: ", error);
        }
    };

    const debounceFetchFolders = useCallback(debounce(fetchFolders, 500), [file.user]);

    useEffect(() => {
        return () => {
            debounceFetchFolders.cancel();
        };
    }, [debounceFetchFolders]);

    return (
        <Container sx={{display: "flex", flexDirection: "column", alignItems: "center", mt: 3, mb:3}} maxWidth={"lg"}>
            {loading && (
                <Box>
                    <CircularProgress sx={{mt: 3}}/>
                </Box>
            )}
            {!loading && (
                <Card sx={{width: "100%"}}>
                    <CardActions>
                        <IconButton sx={{ mr: 3 }} onClick={() => navigate(-1)}>
                            <ArrowBack/>
                        </IconButton>
                    </CardActions>
                    <CardContent>
                        <form>
                            <TextField
                                id={"name"}
                                label={"name"}
                                defaultValue={file.name}
                                variant={"outlined"}
                                fullWidth
                                sx={{mb: 2}}
                                onChange={(event) => setFile({...file, name: event.target.value})}
                            />
                            <Autocomplete
                                id={"folder"}
                                sx={{mb: 2}}
                                fullWidth
                                options={folders}
                                value={selectedFolder}
                                getOptionLabel={(option) => `${option.name}`}
                                renderInput={(params) => (
                                    <TextField {...params} label={"folder"} variant={"outlined"}/>
                                )}
                                onInputChange={(event, value, reason) => {
                                    if (reason === "input") {
                                        if (value === "")
                                            setFile({...file, folder: NaN});
                                        debounceFetchFolders(value);
                                    }
                                }}
                                onChange={(event, value) => {
                                    setSelectedFolder(value);
                                    if (value) {
                                        setFile({...file, folder: value.id});
                                    } else {
                                        setFile({...file, folder: NaN});
                                    }
                                }}
                            />
                            <TextField
                                id={"content"}
                                label={"content"}
                                defaultValue={file.content}
                                variant={"outlined"}
                                multiline
                                minRows={4}
                                fullWidth
                                sx={{mb: 2}}
                                onChange={(event) => setFile({...file, content: event.target.value})}
                            />
                        </form>
                    </CardContent>
                    <CardActions sx={{justifyContent: "flex-end"}}>
                        <Button onClick={editFile}>Save</Button>
                    </CardActions>
                </Card>
            )}
        </Container>
    );
};