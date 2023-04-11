import {AppBar, Box, Button, Toolbar, Typography} from "@mui/material";
import {Link, useLocation} from "react-router-dom";

export const AppMenu = () => {
    const location = useLocation()
    const path = location.pathname;

    return (
        <Box>
            <AppBar position={"static"}>
                <Toolbar>
                    <Button component={Link} to={"/"} disableRipple={true}>
                        <img style={{width: "50px", marginRight: "10px"}} src={"../../assets/brain.png"} alt={"brainbox-logo"}/>
                    </Button>
                    <Typography variant={"h6"}>BrainBox</Typography>
                    <Button
                        component={Link}
                        to={"/users"}
                        variant={path.startsWith("/users") ? "outlined" : "text"}
                        color={"inherit"}
                        sx={{ml: 3}}>
                        Users
                    </Button>
                    <Button
                        component={Link}
                        to={"/folders"}
                        variant={path.startsWith("/folders") ? "outlined" : "text"}
                        color={"inherit"}
                        sx={{ml: 3}}>
                        Folders
                    </Button>
                    <Button
                        component={Link}
                        to={"/files"}
                        variant={path.startsWith("/files") ? "outlined" : "text"}
                        color={"inherit"}
                        sx={{ml: 3}}>
                        Files
                    </Button>
                    <Button
                        component={Link}
                        to={"/statistics/users-by-chars-written"}
                        variant={path.startsWith("/statistics/users-by-chars-written") ? "outlined" : "text"}
                        color={"inherit"}
                        sx={{ml: 3}}>
                        Statistics
                    </Button>
                </Toolbar>
            </AppBar>
        </Box>
    );
};