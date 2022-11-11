export function validateLogin(username: String, password: String): boolean {
    return username.toLowerCase() === "aalto" && password === "grades";
}
