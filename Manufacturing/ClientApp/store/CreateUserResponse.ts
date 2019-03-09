import { User } from './User';

export interface CreateUserResponse {
    user?: User;
    errors?: string[];
}