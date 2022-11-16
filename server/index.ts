import express, { Application, Request, Response } from 'express';
import { validateLogin, performSignup, PlainPassword, UserRole } from './auth';

const app: Application = express();
const parsedPort: number = Number(process.env.AALTO_GRADES_BACKEND_PORT);
const port: number = isNaN(parsedPort) ? 3000 : parsedPort;

interface LoginRequest {
  username: String,
  password: PlainPassword,
}

interface SignupRequest {
    username: String,
    password: PlainPassword,
    email: String,
    role: UserRole,
}

const validateUserRole = (role: any): role is UserRole => typeof role === "string" && (
    role === "Teacher" ||
    role === "Student" ||
    role === "Admin"
);

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
    validateUserRole(body.role) &&
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
  validateLogin(req.body.username, req.body.password).then(role => {
      res.send({
          success: true,
          role: role,
      });
  }).catch(error => {
    res.status(401);
    res.send({
      success: false,
      error: error,
    });
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

  performSignup(req.body.username, req.body.email, req.body.password, req.body.role).then(() => {
    res.send({
        success: true
      });
  }).catch(error => {
    // 403 or 400 or 500? The Promise architecture with appropriate rejections should
    // carry this info
    res.status(400);
    return res.send({
      success: false,
      error: error,
    });
  });
});

app.get('*', (req: Request, res: Response) => {
  res.send(`Hello ${req.path}`);
});

app.listen(port, () => {
  console.log(`Hello server, running on port ${port}`);
});
