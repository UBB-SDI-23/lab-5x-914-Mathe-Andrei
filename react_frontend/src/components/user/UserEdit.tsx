import {
    CardContent,
    Container,
    Card,
    IconButton, TextField, Button, CircularProgress, CardActions
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

    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<User>({
        id: 0,
        username: "",
        email: "",
        password: "",
        created_at: "",
        updated_at: "",
        folders: [],
        shared_files: []
    });

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
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <Container sx={{display: "flex", flexDirection: "column", alignItems: "center", mt: 3}}>
            {loading && <CircularProgress/>}
            {!loading && (
                <Card>
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
                                fullWidth
                                sx={{mb: 2}}
                                onChange={(event) => setUser({...user, username: event.target.value})}
                            />
                            <TextField
                                id={"email"}
                                label={"email"}
                                defaultValue={user.email}
                                variant={"outlined"}
                                fullWidth
                                sx={{mb: 2}}
                                onChange={(event) => setUser({...user, email: event.target.value})}
                            />
                            <TextField
                                id={"password"}
                                label={"password"}
                                defaultValue={user.password}
                                variant={"outlined"}
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