import {Box, Container} from "@mui/material";
import {Link, useNavigate} from "react-router-dom";
import {useContext, useEffect} from "react";
import {AuthContext} from "../../services/AuthProvider";

export const StatisticsHome = () => {
    const navigate = useNavigate();
    const context = useContext(AuthContext);

    useEffect(() => {
        if (!context?.authenticated) {
            navigate('/login', {replace: true});
        }
    }, [context?.authenticated]);

    return (
        <Container sx={{display: "flex", justifyContent: "center", gap: 3, mt: 3, mb: 3}}>
            <Box
                component={Link}
                to={"/statistics/users-by-chars-written"}
                sx={{bgcolor: "#1776d2", color: "white", textDecoration: "none", p: 3, ":hover": {bgcolor: "#156dc2"}}}
            >
                Users - Characters Written
            </Box>
            <Box
                component={Link}
                to={"/statistics/folders-by-num-files"}
                sx={{bgcolor: "#1776d2", color: "white", textDecoration: "none", p: 3, ":hover": {bgcolor: "#156dc2"}}}
            >
                Folders - Number of Files
            </Box>
        </Container>
    );
};