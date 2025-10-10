// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import { authOptions } from "../../../lib/authOptions";
export default NextAuth(authOptions);
