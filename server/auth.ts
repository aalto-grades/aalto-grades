export type PlainPassword = String;

export function validateLogin(username: String, password: PlainPassword): boolean {
  return username.toLowerCase() === "aalto" && password === "grades";
}

export function performSignup(username: String, email: String, plainPassword: PlainPassword): boolean {
  return true;
}
