import {Button, Dialog, DialogActions, DialogTitle} from "@mui/material";
import axios from "axios";
import {BACKEND_API_URL} from "../../constants";

interface Props {
    open: boolean,
    folderId?: string | number,
    onClose: (wasDeleted: boolean) => void
}

export const FolderDelete = ({open, folderId, onClose}: Props) => {
    const handleConfirm = async (event: {preventDefault: () => void}) => {
        event.preventDefault();
        await axios.delete(`${BACKEND_API_URL}/folder/${folderId}/`)
            .catch((error) => console.log(error));
        onClose(true);
    };

    const handleCancel = (event: {preventDefault: () => void}) => {
        event.preventDefault();
        onClose(false);
    }

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