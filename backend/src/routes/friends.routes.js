import * as friendsController from '../controllers/friends.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

export default async function friendsRoutes(app) {

	app.post('/friends/:targetId', { preHandler: [verifyJWT] }, friendsController.createFriendRequestController);

	app.get('/friends', { preHandler: [verifyJWT] }, friendsController.getFriendsController);

	app.get('/friends/requests', { preHandler: [verifyJWT] }, friendsController.getPendingFriendRequestsController);

}