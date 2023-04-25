import {User} from "./User";
import {File} from "./File";

export interface SharedFile {
    id: number;
    file: number | File;
    user: number | User;
    permission: string;
}