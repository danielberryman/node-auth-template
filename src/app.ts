import express from "express"
import { PrismaClient } from "@prisma/client"
import jwt from "jsonwebtoken"
import bodyParser from "body-parser"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import bcrypt from "bcryptjs"
import cors from "cors"

dotenv.config()

const app = express();
const port = 4000;
const prisma = new PrismaClient()

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3000'
}));

app.post("/register", async function(req, res) {
  const email = req.body.email
  // get the email and check if it exists
  if (!email) {
    // handle no email on request
    res.send("Email must be included when registering.")
  } else {
    const foundUser = await prisma.user.findUnique({ 
      where: {
        email: email
      }
    })
    if (foundUser) {
      // handle email already in use
      res.send("Email already in use.")
    } else {
      // create new user
      const username = req.body.username
      const password = await bcrypt.hash(req.body.password, 10);
      let newUser
      if (!username || !password) {
        // handle username or password not found
        res.send("Username and password must be included when registrating.")
      } else {
        newUser = {
          username: username,
          password: password,
          email: email
        }
        const user = await prisma.user.create({ data: newUser })
        if (!user) {
          // handle user not being created
          res.send("An error occurred during registration.")
        } else {
          // handle user registered successfully
          res.send("Your registration was successful!")
        }
      }
    }
  }
})

app.post("/login", async function(req, res) {
  const email = req.body.email
  // get the email and check if it exists
  if (!email) {
    // handle no email on request
    res.send("Email must be included when registrating.")
  } else {
    const foundUser = await prisma.user.findUnique({ 
      where: {
        email: email
      }
    })
    if (!foundUser) {
      // handle email not found in db
      res.send("Email not registered.")
    } else {
      // match password
      const password = req.body.password; 
			const foundUserPassword = foundUser.password; 
		
			const passwordMatch = await bcrypt.compare(password, foundUserPassword);

      if (!passwordMatch) {
        // handle password incorrect
        res.send("Password incorrect.")
      } else {
        const username = foundUser.username;
				
				const userEmail = req.body.email;
				const payload = { email: userEmail };

				const token = generateAccessToken(payload);
        res.cookie("token", token, { httpOnly: true });
				
				res.json({ AccessToken: token, message: `Welcome back, ${username}`});
      }
    }
  }
})

app.post("/logout", async function(req, res) {
  res.clearCookie("token")
  res.send("Logout successful.")
})

const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.TOKEN_KEY, { expiresIn: "1h" })
}

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
