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
import axios from "axios";

export const UserAdd = () => {
    const navigate = useNavigate();

    const [user, setUser] = useState<User>({
        id: 0,
        username: "",
        email: "",
        password: ""
    });

    const addUser = async (event: {preventDefault: () => void}) => {
        event.preventDefault();
        try {
            await axios.post(`${BACKEND_API_URL}/users/`, user);
            navigate("/users/");
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <Container sx={{display: "flex", flexDirection: "column", alignItems: "center", mt: 3}}>
            <Card>
                <CardActions>
                    <IconButton sx={{ mr: 3 }} onClick={() => navigate(-1)}>
                        <ArrowBack/>
                    </IconButton>
                </CardActions>
                <CardContent>
                    <form onSubmit={addUser}>
                        <TextField
                            id={"username"}
                            label={"username"}
                            variant={"outlined"}
                            fullWidth
                            sx={{mb: 2}}
                            onChange={(event) => setUser({...user, username: event.target.value})}
                        />
                        <TextField
                            id={"email"}
                            label={"email"}
                            variant={"outlined"}
                            fullWidth
                            sx={{mb: 2}}
                            onChange={(event) => setUser({...user, email: event.target.value})}
                        />
                        <TextField
                            id={"password"}
                            label={"password"}
                            variant={"outlined"}
                            fullWidth
                            sx={{mb: 2}}
                            onChange={(event) => setUser({...user, password: event.target.value})}
                        />
                    </form>
                </CardContent>
                <CardActions sx={{justifyContent: "flex-end"}}>
                    <Button type={"submit"}>Add user</Button>
                </CardActions>
            </Card>
        </Container>
    );
};