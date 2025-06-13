import fastify from 'fastify';
import dotenv from 'dotenv';
import jwt from '@fastify/jwt';

import authRoutes from './routes/auth.routes.js';
import friendsRoutes from './routes/friends.routes.js';

dotenv.config();

const app = fastify({ logger: true });

app.register(jwt, { secret: process.env.JWT_SECRET || 'supersecret' });

await app.register(import('@fastify/swagger'), {
  openapi: {
    info: {
      title: 'Pong Game API',
      description: 'API documentation for ft_transcendence project',
      version: '1.0.0'
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{ bearerAuth: [] }]
  }
});
await app.register(import('@fastify/swagger-ui'), {
  routePrefix: '/docs',
  exposeRoute: true
});


app.register(authRoutes);
app.register(friendsRoutes);




app.listen({ port: process.env.PORT || 3000 }, (err, address) => {
	if (err) {
		app.log.error(err);
		process.exit(1);
	}
	app.log.info(`Server listening at ${address}`);
});

