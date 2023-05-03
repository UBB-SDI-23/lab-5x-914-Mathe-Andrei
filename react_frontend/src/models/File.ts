import {Folder} from "./Folder";
import {User} from "./User";
import {SharedFile} from "./SharedFile";

export interface File {
    id: number;
    name: string;
    content: string;
    user: number | User;
    folder: number | Folder;
    created_at: string;
    updated_at: string;
    shared_users: SharedFile[];
    num_shared_users?: number;
}