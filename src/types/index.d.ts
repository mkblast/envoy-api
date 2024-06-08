declare namespace Express {
    export interface User {
        _id: string;
        email: string;
        first_name: boolean;
        last_name: boolean;
        password: boolean;
        friends: number[];
    }
}
