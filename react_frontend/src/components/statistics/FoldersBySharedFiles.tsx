import React, {useEffect, useState} from "react";
import axios from "axios";
import {BACKEND_API_URL} from "../../constants";
import {
    Box,
    CircularProgress,
    Container,
    Table, TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import {Paginator} from "../misc/Paginator";
import {Folder} from "../../models/Folder";

export const FoldersBySharedFiles = () => {
    const [loading, setLoading] = useState(true);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [totalItems, setTotalItems] = useState<number>(0);
    const itemsPerPage = 50;

    useEffect(() => {
        setLoading(true);
        axios.get(`${BACKEND_API_URL}/statistics/folders-by-shared-users?per_page=${itemsPerPage}&page=${pageNumber}`)
            .then((response) => {
                console.log(response);
                setFolders(response.data.results);
                setTotalItems(response.data.count);
                setLoading(false);
            });
    }, [pageNumber]);

    return (
        <Container sx={{display: "flex", flexDirection: "column", alignItems: "center", mt: 3, mb: 3}}>
            <Typography variant={"h3"} align={"center"}>Folders by number of shared files</Typography>
            {loading && (
                <Box>
                    <CircularProgress sx={{mt: 3}}/>
                </Box>
            )}
            {!loading && (
                <>
                    <TableContainer sx={{mt: 3}}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>#</TableCell>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Shared Users</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {folders.map((folder: Folder, index) => (
                                    <TableRow key={index + 1}>
                                        <TableCell>{(pageNumber - 1) * itemsPerPage + index + 1}</TableCell>
                                        <TableCell>{folder.name}</TableCell>
                                        <TableCell>{folder.num_shared_users}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Paginator
                        sx={{mt: 2, gap: 1}}
                        itemsPerPage={itemsPerPage}
                        totalItems={totalItems}
                        currentPage={pageNumber}
                        paginate={(number) => setPageNumber(number)}
                    />
                </>
            )}
        </Container>
    );
};