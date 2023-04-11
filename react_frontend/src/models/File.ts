import {Folder} from "./Folder";
import {User} from "./User";

export interface File {
    id: number;
    name: string;
    content: string;
    user: User;
    folder: Folder;
    created_at: string;
    updated_at: string;
    shared_users: User[];
}