import {Box, List, ListItem, ListItemButton, ListItemText} from "@mui/material";
import {useEffect} from "react";

interface Props {
    sx: {};
    itemsPerPage: number;
    totalItems: number;
    currentPage: number;
    paginate: (pageNumber: number) => void
}

export const Paginator = ({sx, itemsPerPage, totalItems, currentPage, paginate}: Props) => {
    const pageNumbers = [];
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const pageRange = 2;

    if (totalPages > 10) {
        if (currentPage <= pageRange + 1) {
            pageNumbers.push(...[...Array(currentPage + pageRange).keys()].map(x => x + 1))
            if (totalPages > currentPage + pageRange) {
                pageNumbers.push("...")
                pageNumbers.push(totalPages)
            }
        } else if (currentPage > pageRange + 1 && currentPage <= totalPages - pageRange) {
            pageNumbers.push(1, "...");
            pageNumbers.push(...[...Array(pageRange * 2 + 1).keys()].map(x => x + (currentPage - pageRange)))
            if (totalPages > currentPage + pageRange) {
                pageNumbers.push("...")
                pageNumbers.push(totalPages)
            }
        } else {
            pageNumbers.push(1, "...");
            pageNumbers.push(...[...Array(totalPages - currentPage + pageRange + 1).keys()].reverse().map(x => totalPages - x))
        }
    } else {
        pageNumbers.push(...[...Array(totalPages).keys()].map(x => x + 1))
    }

    return (
        <Box sx={sx}>
            <List sx={{display: "flex"}}>
                {pageNumbers.map((pageNumber, index) => (
                    <ListItem key={index} sx={{p: 0}}>
                        {typeof pageNumber === "number" && (
                            <ListItemButton disabled={pageNumber === currentPage} onClick={() => paginate(pageNumber)}>
                                <ListItemText>{pageNumber}</ListItemText>
                            </ListItemButton>
                        )}
                        {typeof pageNumber !== "number" && (
                            <ListItemText sx={{paddingX: 2}}>{pageNumber}</ListItemText>
                        )}
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};