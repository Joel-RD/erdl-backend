import { IUserDataFrontendRepository } from "../models/types.js";
import { Client } from "@libsql/client"

export class UserDataFrontendRepository implements IUserDataFrontendRepository {
    constructor(private db: Client) { }

    async getDataUser(email: string): Promise<string | boolean> {
        try {
            const result = await this.db.execute({
                sql: `
                    SELECT 
                        u.*,
                        (
                            SELECT json_group_array(
                                json_object(
                                    'id', urls.id,
                                    'original_url', urls.original_url,
                                    'short_url', urls.short_url,
                                    'views', urls.views,
                                    'created_at', urls.created_at
                                )
                            )
                            FROM (
                                SELECT * FROM urls 
                                WHERE user_id = u.id 
                                ORDER BY created_at DESC 
                                LIMIT 20
                            ) AS urls
                        ) as recent_urls
                    FROM users u
                    WHERE u.email = ?
                `,
                args: [email]
            });

            if (result.rows.length === 0) {
                return false;
            }

            const user = result.rows[0];
            return JSON.stringify(user);
        } catch (error) {
            console.log('Error getDataUser on userDataFrontendRepository: ', error);
            return false;
        }
    }
}