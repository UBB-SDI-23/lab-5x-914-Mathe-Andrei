import {Folder} from "./Folder";
import {SharedFile} from "./SharedFile";
import {UserProfile} from "./UserProfile";
import {File} from "./File";

export interface User {
    id: number;
    username: string;
    email: string;
    password?: string;
    created_at: string;
    updated_at: string;
    profile: UserProfile;
    personal_files: File[];
    folders: Folder[];
    shared_files: SharedFile[];
    num_personal_files?: number;
    written_chars?: number;
}