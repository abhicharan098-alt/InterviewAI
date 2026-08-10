/**
 * User-friendly messages for NextAuth error codes (also surfaced as
 * `?error=` query params on /login and /register). Never exposes secrets,
 * tokens, stack traces or internal details.
 */
export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  OAuthSignin:
    "There was a problem starting Google sign-in. Please try again.",
  OAuthCallback:
    "Google sign-in was not completed. You may have cancelled the request — please try again.",
  OAuthCreateAccount:
    "We couldn't create your account from your Google profile. Please try again.",
  EmailCreateAccount:
    "We couldn't create your account. Please try again.",
  Callback:
    "Google sign-in was not completed. You may have cancelled the request — please try again.",
  OAuthAccountNotLinked:
    "An account with this email already exists. Please sign in with your email and password, or contact support.",
  EmailSignin:
    "The email sign-in link could not be sent. Please try again.",
  CredentialsSignin:
    "Invalid email or password.",
  SessionRequired:
    "You need to be signed in to access this page.",
  AccessDenied:
    "Google sign-in was not completed. You may have cancelled the request or used an account we can't verify.",
  default:
    "Something went wrong while signing you in. Please try again.",
};