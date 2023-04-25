import {File} from "./File";
import {User} from "./User";

export interface Folder {
    id: number;
    name: string;
    user: number | User;
    parent_folder: number | Folder;
    created_at: string;
    updated_at: string;
    files: File[];
}