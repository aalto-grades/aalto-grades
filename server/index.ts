import express, { Application, Request, Response } from 'express';
import { validateLogin, performSignup, PlainPassword } from './auth';

const app: Application = express();
const parsedPort = Number(process.env.AALTO_GRADES_BACKEND_PORT);
const port: number = isNaN(parsedPort) ? 3000 : parsedPort;

interface LoginRequest {
  username: String,
  password: PlainPassword,
}

interface SignupRequest {
    username: String,
    password: PlainPassword,
    email: String,
}

const validateLoginFormat = (body: any): body is LoginRequest =>
    body &&
    body.username &&
    body.password &&
    typeof body.username === "string" &&
    typeof body.password === "string";

const validateSignupFormat = (body: any): body is SignupRequest =>
    body &&
    body.username &&
    body.password &&
    body.email &&
    typeof body.username === "string" &&
    typeof body.password === "string" &&
    typeof body.email === "string";


app.post('/v1/auth/login', express.json(), (req: Request, res: Response) => {
  if (!validateLoginFormat(req.body)) {
    res.status(400);
    return res.send({
        success: false,
        error: "Invalid login request format",
    });
  }

  // TODO: Rather use Promises here? Team feedback needed
  if (!validateLogin(req.body.username, req.body.password)) {
    res.status(401);
    return res.send({
      success: false,
      error: "Invalid login credentials",
    });
  }

  return res.send({
      success: true
  });
});

app.post('/v1/auth/signup', express.json(), (req: Request, res: Response) => {
  if (!validateSignupFormat(req.body)) {
    res.status(400); 
    return res.send({
        success: false,
        error: "Invalid signup request format",
    });
  }

  // TODO: Rather use Promises here? Team feedback needed
  if (!performSignup(req.body.username, req.body.email, req.body.password)) {
    // 403 or 400 or 500? The Promise architecture with appropriate rejections should
    // carry this info
    res.status(400);
    return res.send({
      success: false,
      error: "Signup failed",
    });
  }

  return res.send({
    success: true
  });
});

app.get('*', (req: Request, res: Response) => {
  res.send(`Hello ${req.path}`);
});

app.listen(port, () => {
  console.log(`Hello server, running on port ${port}`);
});
