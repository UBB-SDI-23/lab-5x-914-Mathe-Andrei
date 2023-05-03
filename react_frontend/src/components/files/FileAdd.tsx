import {
    Autocomplete,
    Button,
    Card,
    CardActions,
    CardContent,
    Container,
    FormGroup,
    Grid,
    IconButton,
    TextField
} from "@mui/material";
import {ArrowBack} from "@mui/icons-material";
import React, {useCallback, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {File} from "../../models/File";
import axios from "axios";
import {BACKEND_API_URL} from "../../constants";
import {User} from "../../models/User";
import {Folder} from "../../models/Folder";
import {debounce} from "lodash";

export const FileAdd = () => {
    const navigate = useNavigate();

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
    const [errorName, setErrorName] = useState<string>("");
    const [errorUser, setErrorUser] = useState<string>("");
    const [errorFolder, setErrorFolder] = useState<string>("");
    const [errorContent, setErrorContent] = useState<string>("");

    const addFile = async () => {
        try {
            await axios.post(`${BACKEND_API_URL}/files/`, file);
            navigate("/files/");
        } catch (error: any) {
            console.log(error);
            let data = error.response.data;
            setErrorName(("name" in data) ? data.name : "");
            setErrorUser(("user" in data) ? data.user : "");
            setErrorFolder(("folder" in data) ? data.folder : "");
            setErrorContent(("content" in data) ? data.content : "");
        }
    };

    const [users, setUsers] = useState<User[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [disableFolder, setDisableFolder] = useState<boolean>(true);
    const [selectedUser, setSelectedUser] = useState<null | User>(null);
    const [selectedFolder, setSelectedFolder] = useState<null | Folder>(null);

    const fetchUsers = async (query: string) => {
        try {
            const response = await axios.get(`${BACKEND_API_URL}/users?username=${query}`);
            const data = await response.data;
            setUsers(data.results);
        } catch (error) {
            console.log("Error fetching users: ", error);
        }
    };

    const fetchFolders = async (query: string) => {
        try {
            const response = await axios.get(`${BACKEND_API_URL}/folders?name=${query}&username=${selectedUser?.username}`);
            const data = await response.data;
            setFolders(data.results);
        } catch (error) {
            console.log("Error fetching folders: ", error);
        }
    };

    const debounceFetchUsers = useCallback(debounce(fetchUsers, 500), []);
    const debounceFetchFolders = useCallback(debounce(fetchFolders, 500), [selectedUser]);

    useEffect(() => {
        return () => {
            debounceFetchUsers.cancel();
        };
    }, [debounceFetchUsers]);

    useEffect(() => {
        return () => {
            debounceFetchFolders.cancel();
        };
    }, [debounceFetchFolders]);

    return (
        <Container sx={{display: "flex", flexDirection: "column", alignItems: "center", mt: 3, mb: 3}}>
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
                            variant={"outlined"}
                            error={errorName !== ""}
                            helperText={errorName !== "" && errorName}
                            required
                            fullWidth
                            sx={{mb: 2}}
                            onChange={(event) => setFile({...file, name: event.target.value})}
                        />
                        <Autocomplete
                            id={"user"}
                            fullWidth
                            sx={{mb: 2}}
                            options={users}
                            value={selectedUser}
                            getOptionLabel={(option) => `${option.username} - ${option.email}`}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label={"user"}
                                    variant={"outlined"}
                                    error={errorUser !== ""}
                                    helperText={errorUser !== "" && errorUser}
                                    required
                                />
                            )}
                            onInputChange={(event, value, reason) => {
                                if (reason === "input") {
                                    if (value === "")
                                        setFile({...file, user: NaN});
                                    debounceFetchUsers(value);
                                }
                            }}
                            onChange={(event, value) => {
                                setSelectedUser(value);
                                if (value) {
                                    setFile({...file, user: value.id});
                                    setDisableFolder(false);
                                } else {
                                    setFile({...file, user: NaN});
                                    setDisableFolder(true);
                                }
                                setSelectedFolder(null);
                                setFolders([]);
                            }}
                        />
                        <Autocomplete
                            id={"folder"}
                            fullWidth
                            sx={{mb: 2}}
                            disabled={disableFolder}
                            options={folders}
                            value={selectedFolder}
                            getOptionLabel={(option) => `${option.name}`}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label={"folder"}
                                    variant={"outlined"}
                                    error={errorFolder !== ""}
                                    helperText={errorFolder !== "" && errorFolder}
                                />
                            )}
                            onMouseEnter={() => fetchFolders("")}
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
                            variant={"outlined"}
                            error={errorContent !== ""}
                            helperText={errorContent !== "" && errorContent}
                            multiline
                            minRows={4}
                            fullWidth
                            sx={{mb: 2}}
                            onChange={(event) => setFile({...file, content: event.target.value})}
                        />
                    </form>
                </CardContent>
                <CardActions sx={{justifyContent: "flex-end"}}>
                    <Button onClick={addFile}>Add file</Button>
                </CardActions>
            </Card>
        </Container>
    );
};