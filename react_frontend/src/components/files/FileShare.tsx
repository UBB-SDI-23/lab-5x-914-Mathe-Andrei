import {
    Autocomplete,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel, MenuItem,
    Select, TextField
} from "@mui/material";
import axios from "axios";
import {BACKEND_API_URL} from "../../constants";
import React, {useCallback, useEffect, useState} from "react";
import {SharedFile} from "../../models/SharedFile";
import {User} from "../../models/User";
import {File} from "../../models/File";
import {debounce} from "lodash";
import {Simulate} from "react-dom/test-utils";
import error = Simulate.error;

interface Props {
    open: boolean,
    file: File,
    onClose: (wasShared: boolean) => void
}

export const FileShare = ({open, file, onClose}: Props) => {
    const [sharedUser, setSharedUser] = useState<SharedFile>({
        id: NaN,
        user: NaN,
        file: file.id,
        permission: "R"
    });
    const [users, setUsers] = useState<User[]>([]);

    const fetchUsers = async (query: string) => {
        try {
            const response = await axios.get<User[]>(`${BACKEND_API_URL}/users?page=1&username=${query}`);
            let data = await response.data;
            data = data.filter((value) => value.id != (file.user as User).id);
            setUsers(data);
        } catch (error) {
            console.log("Error fetching users: ", error);
        }
    };

    const debounceFetchUsers = useCallback(debounce(fetchUsers, 500), []);

    useEffect(() => {
        return () => {
            debounceFetchUsers.cancel();
        };
    }, [debounceFetchUsers]);

    const handleShare = async (event: { preventDefault: () => void }) => {
        event.preventDefault();
        await axios.post(`${BACKEND_API_URL}/file/${file.id}/shared-users/`, sharedUser)
            .catch((error) => console.log(error));
        onClose(true);
    };

    const handleCancel = (event: {preventDefault: () => void}) => {
        event.preventDefault();
        onClose(false);
    };

    return (
        <Dialog open={open} fullWidth PaperProps={{sx: {p: 1}}}>
            <DialogTitle align={"center"}>Select a user!</DialogTitle>
            <DialogContent sx={{display: "flex", justifyContent: "space-between", gap: 2, overflow: "visible", mt: 1, pb: 0}}>
                <Autocomplete
                    id={"user"}
                    sx={{mb: 2, flexGrow: 5}}
                    options={users}
                    getOptionLabel={(option) => `${option.username} - ${option.email}`}
                    renderInput={(params) => (
                        <TextField {...params} label={"user"} variant={"outlined"}/>
                    )}
                    onInputChange={(event, value, reason) => {
                        if (reason === "input") {
                            if (value === "")
                                setSharedUser({...sharedUser, user: NaN});
                            debounceFetchUsers(value);
                        }
                    }}
                    onChange={(event, value) => {
                        if (value) {
                            setSharedUser({...sharedUser, user: value.id});
                        } else {
                            setSharedUser({...sharedUser, user: NaN});
                        }
                    }}
                />
                <FormControl sx={{flexGrow: 1}}>
                    <InputLabel id={"permission-label"}>permission</InputLabel>
                    <Select
                        id={"permission"}
                        labelId={"permission-label"}
                        label={"permission"}
                        value={sharedUser.permission}
                        onChange={(event) => {
                            setSharedUser({...sharedUser, permission: event.target.value});
                        }}
                    >
                        <MenuItem value={"R"}>Read-Only</MenuItem>
                        <MenuItem value={"RW"}>Read-Write</MenuItem>
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions sx={{justifyContent: "flex-end"}}>
                <Button onClick={handleShare}>Share</Button>
                <Button onClick={handleCancel}>Cancel</Button>
            </DialogActions>
        </Dialog>
    );
};