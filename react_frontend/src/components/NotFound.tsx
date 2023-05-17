import {Box, Typography} from "@mui/material";

export const NotFound = () => {
	return (
		<Box sx={{mt: 3}}>
			<Typography variant={"h3"} align={"center"}>Error 404</Typography>
			<Typography variant={"h3"} align={"center"}>Not Found</Typography>
		</Box>
	);
}