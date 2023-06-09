import {Folder} from "./Folder";
import {SharedFile} from "./SharedFile";

export interface User {
    id: number;
    username: string;
    email: string;
    password: string;
    created_at: string;
    updated_at: string;
    folders: Folder[];
    shared_files: SharedFile[];
    num_personal_files?: number;
    written_chars?: number;
}