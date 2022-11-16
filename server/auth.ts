export type PlainPassword = string;
export type UserRole = 'Teacher' | 'Student' | 'Admin';

export function validateLogin(username: string, password: PlainPassword): Promise<UserRole> {
  return new Promise((resolve, reject) => {
    if (username.toLowerCase() === 'aalto' && password === 'grades') {
      resolve('Admin');
    } else {
      reject('Invalid credentials');
    }
  });
}

export function performSignup(username: string, email: string, plainPassword: PlainPassword, role: UserRole): Promise<void> {
  return new Promise((resolve, reject) => {
    resolve();
  });
}
