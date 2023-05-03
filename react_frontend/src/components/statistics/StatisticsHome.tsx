import {Box, Container} from "@mui/material";
import {Link} from "react-router-dom";

export const StatisticsHome = () => {
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
                to={"/statistics/folders-by-shared-users"}
                sx={{bgcolor: "#1776d2", color: "white", textDecoration: "none", p: 3, ":hover": {bgcolor: "#156dc2"}}}
            >
                Folders - Number of Shared Users
            </Box>
        </Container>
    );
};