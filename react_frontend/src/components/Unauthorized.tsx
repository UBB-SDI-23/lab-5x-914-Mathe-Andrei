import {Box, Typography} from "@mui/material";

export const Unauthorized = () => {
	return (
		<Box sx={{mt: 3}}>
			<Typography variant={"h3"} align={"center"}>Error 401</Typography>
			<Typography variant={"h3"} align={"center"}>Unauthorized</Typography>
		</Box>
	);
};