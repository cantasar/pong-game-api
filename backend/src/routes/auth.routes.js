import * as authController from '../controllers/auth.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

export default async function authRoutes(app, options) {

  app.post('/register', {
    schema: {
      summary: 'Register a new user',
      tags: ['Auth'],
      body: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: { type: 'string' },
          password: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            token: { type: 'string' }
          }
        }
      }
    },
    handler: authController.registerController
  });

  app.post('/login', {
    schema: {
      summary: 'Login a user',
      tags: ['Auth'],
      body: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: { type: 'string' },
          password: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            token: { type: 'string' }
          }
        }
      }
    },
    handler: authController.loginController
  });

  app.get('/me', {
    preHandler: verifyJWT,
    schema: {
      summary: 'Get current user info',
      tags: ['Auth'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            username: { type: 'string' }
          }
        }
      }
    },
    handler: authController.meController
  });

  app.post('/me', {
    preHandler: verifyJWT,
    schema: {
      summary: 'Update current user info',
      tags: ['Auth'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        properties: {
          username: { type: 'string' },
          password: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                username: { type: 'string' },
                updatedAt: { type: 'string', format: 'date-time' }
              }
            }
          }
        }
      }
    },
    handler: authController.updateMeController
  });

  //google auth
  app.get('/auth/google/callback', {
    schema: {
      summary: 'Google OAuth callback',
      tags: ['Auth'],
      response: {
        200: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            username: { type: 'string' }
          }
        }
      }
    },
    handler: authController.googleCallbackController
  });

}
