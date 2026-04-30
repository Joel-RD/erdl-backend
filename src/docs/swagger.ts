import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ERDL URL Shortener API',
      version: '1.0.0',
      description: 'API documentation for ERDL URL Shortener service',
      contact: {
        name: 'ERDL Team',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://api.erdl.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'authTokenAuthorized',
          description: 'JWT token stored in cookie',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: { type: 'object' },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            username: { type: 'string' },
            email: { type: 'string' },
            name: { type: 'string' },
            last_name: { type: 'string' },
            email_verified: { type: 'boolean' },
            account_active: { type: 'boolean' },
            subscription_tier: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        UrlResponse: {
          type: 'object',
          properties: {
            shortUrl: { type: 'string' },
            originalUrl: { type: 'string' },
            clicks: { type: 'integer' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    security: [{ cookieAuth: [] }],
  },
  apis: ['./src/routers/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
