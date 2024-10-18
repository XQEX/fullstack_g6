import { NextFunction } from "express";

// check if user is logged-in
const checkAuthenticated = async (req: any, res: any, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ msg: "Not authenticated", ok: false });
  }

  next();
};

// check if user is admin (always call this after authentication)
const checkAdmin = async (req: any, res: any, next: NextFunction) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(401).json({
        msg: "Pixelian don't have permission to do this action",
        ok: false,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(403).json({ msg: "Something went wrong", ok: false });
  }

  next();
};

// check if user is not logged-in
const checkUnauthenticated = async (req: any, res: any, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return res.status(400).json({ msg: "Already authenticated", ok: false });
  }

  next();
};

export { checkAuthenticated, checkUnauthenticated, checkAdmin };
