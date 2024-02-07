export class CreateUserDto {
    name: string;
    username: string;
    password: string;
    notification_token?: string;
}