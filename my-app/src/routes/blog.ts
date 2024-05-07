import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { verify } from "hono/jwt";
import { createZodSchema, updateZodSchema } from "@tanush__n/blog-post";

export const blogRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    SECRET: string;
  };
  Variables: {
    userId: string;
  };
}>();
/////////////////////////////////////////////////////////////////////////middle ware

blogRouter.use(async (c, next) => {
  const jwt = c.req.header("Authorization");
  if (!jwt) {
    c.status(401);
    return c.json({ error: "unauthorized" });
  }
  const payload = await verify(jwt, c.env.SECRET);
  if (!payload) {
    c.status(401);
    return c.json({ error: "unauthorized" });
  }
  c.set("userId", payload.id);
  await next();
});
///////////////////////////////////////////////////////////////////////// creating post
blogRouter.post("/add", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const body = await c.req.json();
  const { success } = createZodSchema.safeParse(body);
  if (!success) {
    c.status(411);
    return c.json({
      message: "incorrect inputs try again",
    });
  }
  const authorId = c.get("userId");
  try {
    const post = await prisma.post.create({
      data: {
        title: body.title,
        content: body.content,
        authorId: authorId,
      },
    });
    return c.json({ id: post.id });
  } catch (err) {
    console.log(err);
    c.status(403);
    return c.json({
      message: "error while creating post",
    });
  }
});

///////////////////////////////////////////////////////////////////// get all posts todo:add pagination

blogRouter.get("/all", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const posts = await prisma.post.findMany();
    return c.json({ posts });
  } catch (err) {
    c.status(401);
    console.log(err);
    c.json({
      message: "error while trying to update post",
    });
  }
});

/////////////////////////////////////////////////////////////////////geting one post by id
blogRouter.get("/one/:id", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const id = c.req.param("id");
  try {
    const post = await prisma.post.findFirst({
      where: { id },
    });
    return c.json({
      post,
    });
  } catch (err) {
    console.log(err);
    c.status(401);
    return c.json({
      message: "error white geting post",
    });
  }
});

///////////////////////////////////////////////////////////////////// update post
blogRouter.put("/update", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const body = await c.req.json();
  const { success } = updateZodSchema.safeParse(body);
  if (!success) {
    c.status(411);
    return c.json({
      message: "incorrect inputs",
    });
  }
  try {
    const post = await prisma.post.update({
      where: {
        id: body.id,
      },
      data: {
        title: body.title,
        content: body.content,
      },
    });
    return c.json({
      post,
    });
  } catch (err) {
    console.log(err);
    c.status(403);
    return c.json({ message: "error while updatiing error" });
  }
});
