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
import React, {useCallback, useContext, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {Folder} from "../../models/Folder";
import axios from "axios";
import {BACKEND_API_URL} from "../../constants";
import {User} from "../../models/User";
import {debounce} from "lodash";
import {AuthContext} from "../../services/AuthProvider";

export const FolderAdd = () => {
    const navigate = useNavigate();
    const context = useContext(AuthContext);

    useEffect(() => {
        if (!context?.authenticated) {
            navigate('/login', {replace: true});
        }
    }, [context?.authenticated]);

    const [folder, setFolder] = useState<Folder>({
        id: NaN,
        name: "",
        user: NaN,
        parent_folder: NaN,
        files: [],
        created_at: "",
        updated_at: ""
    });
    const [errorName, setErrorName] = useState<string>("");
    const [errorUser, setErrorUser] = useState<string>("");
    const [errorParentFolder, setErrorParentFolder] = useState<string>("");

    const addFolder = async () => {
        if (folder.name === "") {
            setErrorName("Name cannot be blank!");
            return;
        } else {
            setErrorName("");
        }

        try {
            await axios.post(`${BACKEND_API_URL}/folders/`, folder);
            navigate("/folders/");
        } catch (error: any) {
            console.log(error);
            let data = error.response.data;
            setErrorName(("name" in data) ? data.name : "");
            setErrorUser(("user" in data) ? data.user : "");
            setErrorParentFolder(("parent_folder" in data) ? data.parent_folder : "");
        }
    };

    const [users, setUsers] = useState<User[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [disableParentFolder, setDisableParentFolder] = useState<boolean>(false);
    const [selectedUser, setSelectedUser] = useState<null | User>(null);
    const [selectedParentFolder, setSelectedParentFolder] = useState<null | Folder>(null);

    useEffect(() => {
        axios.get(`${BACKEND_API_URL}/user/${context?.userId}/`)
            .then((response) => {
                console.log(response);
                setSelectedUser(response.data);
                setFolder({...folder, user: context?.userId as number});
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

    const fetchUsers = async (query: string) => {
        try {
            const response = await axios.get(`${BACKEND_API_URL}/users?page_size=10&username=${query}`);
            const data = await response.data;
            setUsers(data.results);
        } catch (error: any) {
            console.log("Error fetching users: ", error);
        }
    };

    const fetchFolders = async (query: string) => {
        try {
            const response = await axios.get(`${BACKEND_API_URL}/folders?page_size=10&name=${query}&username=${selectedUser?.username}`);
            const data = await response.data;
            setFolders(data.results);
        } catch (error: any) {
            console.log("Error fetching folders: ", error);
        }
    };

    const debounceFetchUsers = useCallback(debounce(fetchUsers, 250), []);
    const debounceFetchFolders = useCallback(debounce(fetchFolders, 250), [selectedUser]);

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
                            onChange={(event) => setFolder({...folder, name: event.target.value})}
                        />
                        <Autocomplete
                            id={"user"}
                            fullWidth
                            disabled
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
                                setSelectedParentFolder(null);
                                setFolders([]);
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
                                <TextField
                                    {...params}
                                    label={"parent folder"}
                                    variant={"outlined"}
                                    error={errorParentFolder !== ""}
                                    helperText={errorParentFolder !== "" && errorParentFolder}
                                />
                            )}
                            onMouseEnter={() => fetchFolders("")}
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