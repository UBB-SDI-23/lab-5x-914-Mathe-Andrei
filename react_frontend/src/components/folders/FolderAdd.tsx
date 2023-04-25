import {
    Autocomplete,
    Button,
    Card,
    CardActions,
    CardContent,
    Container,
    IconButton,
    TextField
} from "@mui/material";
import {ArrowBack} from "@mui/icons-material";
import React, {useCallback, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {Folder} from "../../models/Folder";
import axios from "axios";
import {BACKEND_API_URL} from "../../constants";
import {User} from "../../models/User";
import {debounce} from "lodash";

export const FolderAdd = () => {
    const navigate = useNavigate();

    const [folder, setFolder] = useState<Folder>({
        id: NaN,
        name: "",
        user: NaN,
        parent_folder: NaN,
        files: [],
        created_at: "",
        updated_at: ""
    });

    const addFolder = async () => {
        try {
            await axios.post(`${BACKEND_API_URL}/folders/`, folder);
            navigate("/folders/");
        } catch (error) {
            console.log(error);
        }
    };

    const [users, setUsers] = useState<User[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [disableParentFolder, setDisableParentFolder] = useState<boolean>(true);
    const [selectedUser, setSelectedUser] = useState<null | User>(null);
    const [selectedParentFolder, setSelectedParentFolder] = useState<null | Folder>(null);

    const fetchUsers = async (query: string) => {
        try {
            const response = await axios.get<User[]>(`${BACKEND_API_URL}/users?query=${query}`);
            const data = await response.data;
            setUsers(data);
        } catch (error) {
            console.log("Error fetching users: ", error);
        }
    };

    const fetchFolders = async (query: string) => {
        try {
            const response = await axios.get<Folder[]>(`${BACKEND_API_URL}/folders?name=${query}&username=${selectedUser?.username}`);
            const data = await response.data;
            setFolders(data);
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
                            fullWidth
                            sx={{mb: 2}}
                            onChange={(event) => setFolder({...folder, name: event.target.value})}
                        />
                        <Autocomplete
                            id={"user"}
                            fullWidth
                            sx={{mb: 2}}
                            options={users}
                            value={selectedUser}
                            getOptionLabel={(option) => `${option.username} - ${option.email}`}
                            renderInput={(params) => (
                                <TextField {...params} label={"user"} variant={"outlined"}/>
                            )}
                            onInputChange={(event, value, reason) => {
                                if (reason === "input") {
                                    if (value === "")
                                        setFolder({...folder, user: NaN});
                                    debounceFetchUsers(value);
                                }
                            }}
                            onChange={(event, value) => {
                                setSelectedUser(value);
                                if (value) {
                                    setFolder({...folder, user: value.id});
                                    setDisableParentFolder(false);
                                } else {
                                    setFolder({...folder, user: NaN});
                                    setDisableParentFolder(true);
                                }
                                setFolders([]);
                                setSelectedParentFolder(null);
                            }}
                        />
                        <Autocomplete
                            id={"parent_folder"}
                            fullWidth
                            sx={{mb: 2}}
                            disabled={disableParentFolder}
                            options={folders}
                            value={selectedParentFolder}
                            getOptionLabel={(option) => `${option.name}`}
                            renderInput={(params) => (
                                <TextField {...params} label={"parent folder"} variant={"outlined"}/>
                            )}
                            onInputChange={(event, value, reason) => {
                                if (reason === "input") {
                                    if (value === "")
                                        setFolder({...folder, parent_folder: NaN});
                                    debounceFetchFolders(value);
                                }
                            }}
                            onChange={(event, value) => {
                                setSelectedParentFolder(value);
                                if (value) {
                                    setFolder({...folder, parent_folder: value.id});
                                } else {
                                    setFolder({...folder, parent_folder: NaN});
                                }
                            }}
                        />
                    </form>
                </CardContent>
                <CardActions sx={{justifyContent: "flex-end"}}>
                    <Button onClick={addFolder}>Add folder</Button>
                </CardActions>
            </Card>
        </Container>
    );
};