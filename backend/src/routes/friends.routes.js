import * as friendsController from '../controllers/friends.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

export default async function friendsRoutes(app) {

	app.post('/friends/:targetId', {
		preHandler: [verifyJWT],
		schema: {
			summary: 'Send a friend request to another user',
			tags: ['Friends'],
			security: [{ bearerAuth: [] }],
			params: {
				type: 'object',
				properties: {
					targetId: { type: 'string', description: 'Target user ID to send friend request to' }
				},
				required: ['targetId']
			}
		},
		handler: friendsController.createFriendRequestController
	});

	app.get('/friends', {
		preHandler: [verifyJWT],
		schema: {
			summary: 'Get list of accepted friends',
			tags: ['Friends'],
			security: [{ bearerAuth: [] }]
		},
		handler: friendsController.getFriendsController
	});

	app.get('/friends/requests', {
		preHandler: [verifyJWT],
		schema: {
			summary: 'Get list of pending friend requests received by the user',
			tags: ['Friends'],
			security: [{ bearerAuth: [] }],
		},
		handler: friendsController.getPendingFriendRequestsController
	});

	app.patch('/friends/:id', {
		preHandler: [verifyJWT],
		schema: {
			summary: "Accept or reject a friend request",
			tags: ['Friends'],
			security: [{ bearerAuth: [] }],
			params: {
				type: 'object',
				properties: {
					id: { type: 'string', description: 'Friend request ID' }
				},
				required: ['id']
			},
			body: {
				type: 'object',
				properties: {
					action: { 
						type: 'string', 
						enum: ['accept', 'reject'],
						description: 'Action to take on the friend request'
					}
				},
				required: ['action']
			}
		},
		handler: friendsController.respondToFriendRequestController
	});

}