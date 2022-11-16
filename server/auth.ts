export type PlainPassword = string;
export type UserRole = 'Teacher' | 'Student' | 'Admin';

export async function validateLogin(username: string, password: PlainPassword): Promise<UserRole> {
  if (username.toLowerCase() === 'aalto' && password === 'grades') {
    return 'Admin';
  } else {
    throw 'Invalid credentials';
  }
}

export async function performSignup(username: string, email: string, plainPassword: PlainPassword, role: UserRole) {

}
