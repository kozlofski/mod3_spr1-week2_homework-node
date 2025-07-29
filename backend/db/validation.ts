export function validateUsername(username: string): boolean {
  // 3 to 20 alphanumeric (or underscore) characters
  const nameRegex = new RegExp(/^\w{3,20}$/g);
  return nameRegex.test(username);
}

export function validatePassword(password: string): boolean {
  // should contain big and small letters, a symbol and a number
  // minimum 8 characters long
  const passRegex = new RegExp(
    /(?=.*[a-z])(?=.*[A-Z])(?=.*[!?$])[a-zA-Z0-9!?$]{8,}/g
  );
  const simplePassRegexForTesting = new RegExp(/^\w{3,20}$/g);
  return simplePassRegexForTesting.test(password);
}
