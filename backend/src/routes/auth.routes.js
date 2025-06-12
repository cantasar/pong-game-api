import * as authController from '../controllers/auth.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

export default async function authRoutes(app, options) {

  app.post('/register', authController.registerController);

  app.post('/login', authController.loginController);

  app.get('/me', { preHandler: verifyJWT }, authController.meController);

  app.post('/me', { preHandler: verifyJWT }, authController.updateMeController);

}
