import prisma from "../../config/db.js";
import bcrypt from "bcrypt";
import { signToken } from "../../utils/jwt.js";

class AuthService {
  async register(data) {
    const { email, password, name } = data;

    const exist = await prisma.user.findUnique({
      where: { email },
    });
    if (exist) throw new Error("Email already used");

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        name,
        // role default: USER → sesuai schema
      },
    });

    return user;
  }

  async login(data) {
    const { email, password } = data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) throw new Error("Invalid credentials");

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error("Invalid credentials");

    const token = signToken({
      id: user.id,
      role: user.role, // ADMIN / USER
    });

    return { token, user };
  }
}

export default new AuthService();
