import {File} from "./File";

export interface Folder {
    id: number;
    name: string;
    user: number;
    parent_folder: number;
    created_at: string;
    updated_at: string;
    files: File[];
}