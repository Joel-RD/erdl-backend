
export interface IUserRepository {
    findById(short_url: string): Promise<string | null>;
    create(short_url: string, original_url: string): Promise<string | null>;
}
