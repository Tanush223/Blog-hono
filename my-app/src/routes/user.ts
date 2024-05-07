import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign } from "hono/jwt";
import { signinZodSchema, signupZodSchema } from "@tanush__n/blog-post";

export const userRouter = new Hono<{
  Bindings: { DATABASE_URL: string; SECRET: string };
}>();

////////////////////////////////////////////////////////////////// user sign up
userRouter.post("/signup", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const body = await c.req.json();
  const { success } = signupZodSchema.safeParse(body);
  if (!success) {
    c.status(411);
    return c.json({
      message: "incorrect inputs",
    });
  }

  try {
    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: body.password,
      },
    });
    const token = await sign({ id: user.id }, c.env.SECRET);
    return c.json({ jwt: token });
  } catch (err) {
    c.status(403);
    return c.json({ error: "error while signing up", err });
  }
});

/////////////////////////////////////////////////////////////////// user sign in
userRouter.post("/signin", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const body = await c.req.json();
  const { success } = signinZodSchema.safeParse(body);
  if (!success) {
    c.status(411);
    return c.json({
      message: "incorrect inputs",
    });
  }
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: body.email,
        password: body.password,
      },
    });
    if (!user) {
      return c.json({
        error: "user not found incorrect password or try creating account",
      });
    }
    const token = await sign({ id: user.id }, c.env.SECRET);
    return c.json({ jwt: token });
  } catch (err) {
    c.status(403);
    return c.json({
      error: "error while signing up ",
      err,
    });
  }
});
