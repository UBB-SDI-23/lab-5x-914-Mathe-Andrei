import {
    CardContent,
    Container,
    Card,
    IconButton, TextField, Button, CircularProgress, CardActions, Box
} from "@mui/material";
import React, {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {ArrowBack} from "@mui/icons-material";
import {User} from "../../models/User"
import {BACKEND_API_URL} from "../../constants";
import axios from "axios";

export const UserEdit = () => {
    const {id} = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User>({
        id: NaN,
        username: "",
        email: "",
        password: "",
        folders: [],
        shared_files: [],
        created_at: "",
        updated_at: ""
    });
    const [errorUsername, setErrorUsername] = useState<string>("");
    const [errorEmail, setErrorEmail] = useState<string>("");
    const [errorPassword, setErrorPassword] = useState<string>("");

    useEffect(() => {
        setLoading(true);
        axios.get(`${BACKEND_API_URL}/user/${id}/`)
            .then((response) => {
                setUser(response.data);
                setLoading(false);
            })
            .catch((error) => console.log(error));
    }, []);

    const editUser = async (event: {preventDefault: () => void}) => {
        event.preventDefault();
        try {
            await axios.patch(`${BACKEND_API_URL}/user/${id}/`, user);
            navigate(-1);
        } catch (error: any) {
            console.log(error);
            let data = error.response.data;
            setErrorUsername(("username" in data) ? data.username : "");
            setErrorEmail(("email" in data) ? data.email : "");
            setErrorPassword(("password" in data) ? data.password : "");
        }
    };

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
                                id={"username"}
                                label={"username"}
                                defaultValue={user.username}
                                variant={"outlined"}
                                error={errorUsername !== ""}
                                helperText={errorUsername !== "" && errorUsername}
                                fullWidth
                                sx={{mb: 2}}
                                onChange={(event) => setUser({...user, username: event.target.value})}
                            />
                            <TextField
                                id={"email"}
                                label={"email"}
                                defaultValue={user.email}
                                variant={"outlined"}
                                error={errorEmail !== ""}
                                helperText={errorEmail !== "" && errorEmail}
                                fullWidth
                                sx={{mb: 2}}
                                onChange={(event) => setUser({...user, email: event.target.value})}
                            />
                            <TextField
                                id={"password"}
                                label={"password"}
                                defaultValue={user.password}
                                variant={"outlined"}
                                error={errorPassword !== ""}
                                helperText={errorPassword !== "" && errorPassword}
                                fullWidth
                                sx={{mb: 2}}
                                onChange={(event) => setUser({...user, password: event.target.value})}
                            />
                        </form>
                    </CardContent>
                    <CardActions sx={{justifyContent: "flex-end"}}>
                        <Button onClick={editUser}>Save</Button>
                    </CardActions>
                </Card>
            )}
        </Container>
    );
};