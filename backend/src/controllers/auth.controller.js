import prisma from '../db/client.js';
import bcrypt from 'bcrypt';

// kullanicilarin kayit ve giris islemleri
export async function registerController(request, reply) {
  try {
    const { username, password } = request.body;

    if (!username?.trim() || !password?.trim()) {
      return reply.code(400).send({ error: 'Username and password are required and cannot be empty' });
    }

    if (password.length < 6) {
      return reply.code(400).send({ error: 'Password must be at least 6 characters long' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { username: username.trim() }
    });

    if (existingUser) {
      return reply.code(400).send({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username: username.trim(),
        password: hashedPassword
      }
    });

    const token = request.server.jwt.sign(
      { userId: user.id, username: user.username },
      { expiresIn: '7d' }
    );

    return reply.code(201).send({ token });
  } catch (error) {
    console.error('Register error:', error);
    return reply.code(500).send({ error: 'Internal server error during registration' });
  }
}

// kullanicilarin giris islemleri
export async function loginController(request, reply) {
  try {
    const { username, password } = request.body;

    if (!username?.trim() || !password?.trim()) {
      return reply.code(400).send({ error: 'Username and password are required and cannot be empty' });
    }

    const user = await prisma.user.findUnique({
      where: { username: username.trim() }
    });

    if (!user) {
      return reply.code(401).send({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return reply.code(401).send({ error: 'Invalid credentials' });
    }

    const token = request.server.jwt.sign(
      { userId: user.id, username: user.username },
      { expiresIn: '7d' }
    );
    
    return reply.code(200).send({ token });
  } catch (error) {
    console.error('Login error:', error);
    return reply.code(500).send({ error: 'Internal server error during login' });
  }
}

// kullanicinin kendi bilgilerini alma islemi
export async function meController(request, reply) {
  try {
    const { userId } = request.user;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true }
    });

    if (!user) {
      return reply.code(404).send({ error: 'User not found' });
    }

    return reply.code(200).send({ username: user.username });
  } catch (error) {
    console.error('Get user error:', error);
    return reply.code(500).send({ error: 'Internal server error while fetching user data' });
  }
}

// kullanicinin kendi bilgilerini guncelleme islemleri
export async function updateMeController(request, reply) {
  try {
    const { userId } = request.user;
    const { username, password } = request.body;

    if (!username?.trim() && !password?.trim()) {
      return reply.code(400).send({ 
        error: 'At least one field (username or password) is required for update' 
      });
    }

    if (password && password.length < 6) {
      return reply.code(400).send({ error: 'Password must be at least 6 characters long' });
    }

    if (username) {
      const existingUser = await prisma.user.findUnique({
        where: { username: username.trim() }
      });
      
      if (existingUser && existingUser.id !== userId) {
        return reply.code(400).send({ 
          error: 'Username is already taken' 
        });
      }
    }

    const dataToUpdate = {};
    if (username) dataToUpdate.username = username.trim();
    if (password) dataToUpdate.password = await bcrypt.hash(password, 10);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: {
        username: true,
        updatedAt: true
      }
    });

    return reply.code(200).send({
      message: 'User updated successfully',
      user: {
        username: updatedUser.username,
        updatedAt: updatedAt
      }
    });

  } catch (error) {
    console.error('Update user error:', error);
    if (error.code === 'P2025') {
      return reply.code(404).send({ error: 'User not found' });
    }
    return reply.code(500).send({ error: 'Failed to update user' });
  }
}

// Google OAuth2 kullanici olusturma ve oturum acma islemleri
export async function googleCallbackController(request, reply) {
  const tokenResponse = await request.server.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);

  const userInfo = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokenResponse.token.access_token}`  }
  }).then(res => res.json());

  console.log(userInfo); // buradan email name ve picture alinacak

  const { email, name } = userInfo;

  let user = await prisma.user.findUnique({
    where: { username: email }
  })

  if (!user){
    user = await prisma.user.create({
      data: {
        username: email,
        password: ''
      }
    })
  }

  const token = request.server.jwt.sign({
    userId: user.id,
    username: user.username
  });


  return reply.send({ token, username: user.username });
}