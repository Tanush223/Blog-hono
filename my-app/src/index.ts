import { Hono } from "hono";

import { userRouter } from "./routes/user";
import { blogRouter } from "./routes/blog";

const app = new Hono<{
  Bindings: { DATABASE_URL: string; SECRET: string };
}>();

app.get("/", (c) => {
  return c.text("Helloooooo");
});

app.route("/user", userRouter);
app.route("/blog", blogRouter);

export default app;
