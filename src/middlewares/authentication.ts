import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../entities/User";

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.cookies;
    if (!token) throw new Error("Unauthenticated!");

    const { username }: any = await jwt.verify(token, process.env.JWT_SECRET!);
    const user = await User.findOne({ username });
    if (!user) throw new Error("Unauthenticated!");

    res.locals.user = user;
    return next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({ error: "Unauthenticated!" });
  }
};
