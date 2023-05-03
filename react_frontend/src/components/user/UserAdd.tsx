import {
    CardContent,
    Container,
    Card,
    IconButton, TextField, Button, CardActions
} from "@mui/material";
import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {ArrowBack} from "@mui/icons-material";
import {User} from "../../models/User"
import {BACKEND_API_URL} from "../../constants";
import axios, {Axios, AxiosError} from "axios";

export const UserAdd = () => {
    const navigate = useNavigate();

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

    const addUser = async () => {
        try {
            await axios.post(`${BACKEND_API_URL}/users/`, user);
            navigate("/users/");
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
                            variant={"outlined"}
                            error={errorUsername !== ""}
                            helperText={errorUsername !== "" && errorUsername}
                            required
                            fullWidth
                            sx={{mb: 2}}
                            onChange={(event) => setUser({...user, username: event.target.value})}
                        />
                        <TextField
                            id={"email"}
                            label={"email"}
                            variant={"outlined"}
                            error={errorEmail !== ""}
                            helperText={errorEmail !== "" && errorEmail}
                            required
                            fullWidth
                            sx={{mb: 2}}
                            onChange={(event) => setUser({...user, email: event.target.value})}
                        />
                        <TextField
                            id={"password"}
                            label={"password"}
                            variant={"outlined"}
                            error={errorPassword !== ""}
                            helperText={errorPassword !== "" && errorPassword}
                            required
                            fullWidth
                            sx={{mb: 2}}
                            onChange={(event) => setUser({...user, password: event.target.value})}
                        />
                    </form>
                </CardContent>
                <CardActions sx={{justifyContent: "flex-end"}}>
                    <Button onClick={addUser}>Add user</Button>
                </CardActions>
            </Card>
        </Container>
    );
};