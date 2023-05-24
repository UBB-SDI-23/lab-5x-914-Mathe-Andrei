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
import { Folder } from "../../models/Folder";
import axios from "axios";
import {BACKEND_API_URL} from "../../constants";
import {User} from "../../models/User";
import {debounce} from "lodash";
import {Roles} from "../../models/Roles";
import {useAuthContext} from "../../services/useAuthContext";
import {isOwner} from "../../permissions/IsOwner";
import {hasHigherRole} from "../../permissions/HasHigherRole";

export const FolderEdit = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const context = useAuthContext();

    const [loading, setLoading] = useState(true);
    const [folder, setFolder] = useState<Folder>({
        id: NaN,
        name: "",
        user: NaN,
        parent_folder: NaN,
        files: [],
        created_at: "",
        updated_at: ""
    });
    const [selectedParentFolder, setSelectedParentFolder] = useState<null | Folder>(null);
    const [errorName, setErrorName] = useState<string>("");
    const [errorParentFolder, setErrorParentFolder] = useState<string>("");

    useEffect(() => {
        setLoading(true);
        axios.get(`${BACKEND_API_URL}/folder/${id}/`)
            .then((response) => {
                if (!isOwner(context, response.data.user) && !hasHigherRole(context, response.data.user)) {
                    navigate("/unauthorized", {replace: true});
                    return;
                }
                setFolder(response.data);
                setSelectedParentFolder(response.data.parent_folder);
                setLoading(false);
            })
            .catch((error) => {
                if (error.response && error.response.status === 404) {
                    navigate("/notfound");
                }
                console.log(error);
            });
    }, []);

    const editFolder = async (event: {preventDefault: () => void}) => {
        event.preventDefault();
        if (folder.name === "") {
            setErrorName("Name cannot be blank!");
            return;
        } else {
            setErrorName("");
        }

        if (typeof folder.parent_folder !== "number" && folder.parent_folder !== null)
            folder.parent_folder = folder.parent_folder.id;
        try {
            await axios.patch(`${BACKEND_API_URL}/folder/${id}/`, folder);
            navigate(-1);
        } catch (error: any) {
            console.log(error);
            let data = error.response.data;
            setErrorName(("name" in data) ? data.name : "");
            setErrorParentFolder(("parent_folder" in data) ? data.parent_folder : "");
        }
    };

    const [folders, setFolders] = useState<Folder[]>([]);

    const fetchFolders = async (query: string) => {
        try {
            const response = await axios.get(`${BACKEND_API_URL}/folders?page_size=10&name=${query}&username=${(folder.user as User).username}`);
            let data = await response.data;
            data = data.results.filter((value: Folder) => value.id != folder.id)
            setFolders(data);
        } catch (error: any) {
            console.log("Error fetching folders: ", error);
        }
    };

    const debounceFetchFolders = useCallback(debounce(fetchFolders, 250), [folder.id, folder.user]);

    useEffect(() => {
        return () => {
            debounceFetchFolders.cancel();
        };
    }, [debounceFetchFolders]);

    return (
        <Container sx={{display: "flex", flexDirection: "column", alignItems: "center", mt: 3, mb: 3}}>
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
                                defaultValue={folder.name}
                                variant={"outlined"}
                                error={errorName !== ""}
                                helperText={errorName !== "" && errorName}
                                required
                                fullWidth
                                sx={{mb: 2}}
                                onChange={(event) => setFolder({...folder, name: event.target.value})}
                            />
                            <Autocomplete
                                id={"parent_folder"}
                                sx={{mb: 2}}
                                fullWidth
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
                        <Button onClick={editFolder}>Save</Button>
                    </CardActions>
                </Card>
            )}
        </Container>
    );
};