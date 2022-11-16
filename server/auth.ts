export type PlainPassword = String;
export type UserRole = "Teacher" | "Student" | "Admin";

export function validateLogin(username: String, password: PlainPassword): Promise<UserRole> {
  return new Promise((resolve, reject) => {
      if (username.toLowerCase() === "aalto" && password === "grades") {
          resolve("Admin");
      } else {
          reject("Invalid credentials");
      }
  });
}

export function performSignup(username: String, email: String, plainPassword: PlainPassword, role: UserRole): Promise<void> {
  return new Promise((resolve, reject) => {
    resolve();
  });
}
