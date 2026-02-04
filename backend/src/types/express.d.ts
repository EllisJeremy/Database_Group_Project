import { Express } from "express-serve-static-core";

export type UserType = {
  id: number;
  email: string;
  name: string;
};

declare global {
  namespace Express {
    interface Request {
      user: UserType;
    }
  }
}
