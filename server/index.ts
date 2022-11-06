import express, { Application, Request, Response } from 'express';

const app: Application = express();
const port: number = 3000;

app.get('*', (req: Request, res: Response) => {
  res.send(`Hello ${req.path}`);
});

app.listen(port, () => {
  console.log('Hello server');
});
