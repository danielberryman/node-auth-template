import express from 'express'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'

dotenv.config()

const app = express();
const port = 3000;
const prisma = new PrismaClient()

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use(cookieParser());

app.get('/', function(request, response) {
  response.send(`
    <div class="register-form">
      <h1>Create User</h1>
      <form action="register" method="POST">
        <input type="text" name="username" placeholder="Username" required>
        <input type="password" name="password" placeholder="Password" required>
        <input type="email" name="email" placeholder="Email" required>
        <input type="submit">
      </form>
    </div>
  `);
});

app.get('/login', function(request, response) {
  response.send(`
    <div class="login-form">
      <h1>Create User</h1>
      <form action="login" method="POST">
        <input type="text" name="username" placeholder="Username" required>
        <input type="password" name="password" placeholder="Password" required>
        <input type="submit">
      </form>
    </div>
  `);
});

app.get('/hitdb', async (req, res) => {
  const allUsers = await prisma.user.findMany()
  res.send(`
    <div>Welcome back, ${allUsers[0].username}!</div>
  `);
});

app.post('/register', async function(request, response) {
	const username = request.body.username
	const password = request.body.password
	const email = request.body.email
  let user
  let token

	if (username && password) {
    user = {
      username: username,
      password: password,
      email: email
    }
    const createUser = await prisma.user.create({ data: user })
    if (createUser) {
      token = jwt.sign(
        { user_id: createUser.id, email: createUser.email },
        process.env.TOKEN_KEY,
        { expiresIn: "2h" }
      );
      // save user token
      const updateUser = await prisma.user.update({ 
        where: {
          id: createUser.id,
        },
        data: { 
          token 
        } 
      })
      console.dir(updateUser);
    }
    // response.cookie('token', token);
    response.cookie('token', token, { httpOnly: true });
    response.json({ token });
    // response.status(201).json(user);
    response.end();
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.post('/login', async function(request, response) {
  const username = request.body.username
	const password = request.body.password
  let user

	if (username && password) {
    const foundUser = await prisma.user.findUnique({ 
      where: {
        userJwtCheck: {
          username: username,
          password: password,
          token: request.cookies['token']
        },
      }
    })
    if (foundUser) {
      response.send(`Welcome back, ${foundUser.username}`);
    } else {
      response.send('Invalid username and password');
    }
	} else {
		response.send('Must submit username and password');
		response.end();
	}
})

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
