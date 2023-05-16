import {Container, Typography} from "@mui/material";
import {useContext, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {AuthContext} from "../services/AuthProvider";

export const AppHome = () => {
    const navigate = useNavigate();
    const context = useContext(AuthContext);

    useEffect(() => {
        if (!context?.authenticated) {
            navigate("/login", {replace: true});
        }
    }, [context?.authenticated]);

    return (
        <Container>
            <Typography variant={"h1"} align={"center"} marginTop={10}>Welcome</Typography>
        </Container>
    );
};