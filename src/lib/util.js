import jwt from 'jsonwebtoken'

// export const generateToken = (userId, res) => {
//     const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '3d' });

// if (res && typeof res.cookie === 'function') {
//   res.cookie("jwt", token, {
//     httpOnly: true,
//     secure: true,
//     sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
//     maxAge: 1000 * 60 * 60 * 24, // e.g. 1 day
//   });
// }
//     return token;
// }
export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });

  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 3 * 24 * 60 * 60 * 1000,
  });

  return token;
};
