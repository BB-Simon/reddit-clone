import { Request, Response, Router } from "express";
import Comment from "../entities/Comment";
import { Post } from "../entities/Post";
import { Sub } from "../entities/Sub";
import isAuthenticated from "../middlewares/authentication";

const createPost = async (req: Request, res: Response) => {
  const { title, body, sub } = req.body;
  const user = res.locals.user;

  if (title.trim() === "")
    return res.status(400).json({ title: "title can't be empty" });

  try {
    // find sub
    const subRecord = await Sub.findOneOrFail({ name: sub });

    // Craete Post
    const post = new Post({ title, body, user, sub: subRecord });
    await post.save();

    return res.json(post);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Something went wrong!" });
  }
};

const getPosts = async (_: Request, res: Response) => {
  try {
    const posts = await Post.find({
      order: { createdAt: "DESC" },
      relations: ["comments", "votes", "sub"],
    });

    return res.status(200).json(posts);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ erros: "Something went wrong!" });
  }
};

const getPost = async (req: Request, res: Response) => {
  const { identifier, slug } = req.params;
  try {
    const post = await Post.findOneOrFail(
      { identifier, slug },
      { relations: ["sub"] }
    );

    return res.status(200).json(post);
  } catch (err) {
    console.log(err);
    return res.status(404).json({ erros: "Post not found!" });
  }
};

const commentOnPost = async (req: Request, res: Response) => {
  const { identifier, slug } = req.params;
  const body = req.body.body;

  try {
    const post = await Post.findOneOrFail({ identifier, slug });

    const comment = new Comment({
      body,
      user: res.locals.user,
      post,
    });

    await comment.save();

    return res.status(201).json(comment);
  } catch (err) {
    console.log(err);
    return res.status(404).json({ erros: "Post not found!" });
  }
};

const router = Router();

router.post("/", isAuthenticated, createPost);
router.get("/", getPosts);
router.get("/:identifier/:slug", getPost);
router.post("/:identifier/:slug/comments", isAuthenticated, commentOnPost);

export default router;
