const isProduction = process.env.NODE_ENV === "production";

/**
 * Common cookie options for both manual JWT and Google login
 * @param {boolean} isRefresh - Is this a refresh token cookie?
 */
const getCookieOptions = (isRefresh = false) => {
  const opts = {
    httpOnly: true,
    secure: isProduction,
    // Using Lax on localhost (even for cross-port) is usually safer than None without HTTPS
    sameSite: isProduction ? "none" : "lax",
    maxAge: isRefresh ? 7 * 24 * 60 * 60 * 1000 : 15 * 60 * 1000,
  };
  if (isRefresh) opts.path = "/api/auth/refresh";
  return opts;
};

module.exports = { getCookieOptions };
