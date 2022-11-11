import express, { Application, Request, Response } from 'express';
import { validateLogin } from './auth';

const app: Application = express();
const parsedPort = Number(process.env.AALTO_GRADES_BACKEND_PORT);
const port: number = isNaN(parsedPort) ? 3000 : parsedPort;

interface LoginRequest {
  username: String,
  password: String,
}

const validateLoginFormat = (body: any): body is LoginRequest => body && body.username && body.password;

app.post('/v1/auth/login', express.json(), (req: Request, res: Response) => {
  if (!validateLoginFormat(req.body)) {
    res.status(400);
    return res.send({
        success: false,
        error: "Invalid login request format",
    });
  }

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

app.get('*', (req: Request, res: Response) => {
  res.send(`Hello ${req.path}`);
});

app.listen(port, () => {
  console.log(`Hello server, running on port ${port}`);
});
