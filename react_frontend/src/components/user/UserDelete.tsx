import {Button, Dialog, DialogActions, DialogTitle} from "@mui/material";
import axios from "axios";
import {BACKEND_API_URL} from "../../constants";
import {Simulate} from "react-dom/test-utils";
import error = Simulate.error;
import {useContext} from "react";
import {AuthContext} from "../../services/AuthProvider";

interface Props {
    open: boolean,
    userId?: string | number,
    onClose: (wasDeleted: boolean) => void
}

export const UserDelete = ({open, userId, onClose}: Props) => {
    const context = useContext(AuthContext);

    const handleConfirm = async (event: { preventDefault: () => void }) => {
        event.preventDefault();
        await axios.delete(`${BACKEND_API_URL}/user/${userId}/`)
            .then((response) => console.log(response))
            .catch((error) => {
                console.log(error);
            });
        onClose(true);
    };

    const handleCancel = (event: {preventDefault: () => void}) => {
        event.preventDefault();
        onClose(false);
    };

    return (
        <Dialog open={open} PaperProps={{sx: {p: 1}}}>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogActions sx={{display: "flex", justifyContent: "space-between"}}>
                <Button onClick={handleConfirm}>Confirm</Button>
                <Button onClick={handleCancel}>Cancel</Button>
            </DialogActions>
        </Dialog>
    );
};