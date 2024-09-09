const express = require("express");
const multer = require("multer");

const Post = require("../models/post");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg"
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid mime type");
    if (isValid) {
      error = null;
    }
    cb(error, "backend/images");
  },
  filename: (req, file, cb) => {
    const name = file.originalname
      .toLowerCase()
      .split(" ")
      .join("-");
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + "-" + Date.now() + "." + ext);
  }
});

router.post(
  "",
  checkAuth,
  multer({ storage: storage }).single("image"),
  (req, res, next) => {
    const url = req.protocol + "://" + req.get("host");
    const post = new Post({
      title: req.body.title,
      movie: req.body.movie,
      content: req.body.content,
      rating: req.body.rating,
      imagePath: url + "/images/" + req.file.filename,
      creator: req.userData.userId,
      userName: req.body.userName
    });
    post.save().then(createdPost => {
      res.status(201).json({
        message: "Post added successfully",
        post: {
          ...createdPost,
          id: createdPost._id
        }
      });
    });
  }
);

router.put(
  "/:id",
  checkAuth,
  multer({ storage: storage }).single("image"),
  (req, res, next) => {

    Post.findById(req.params.id).then(post => {
      if (!post) {
        return res.status(404).json({ message: "Post not found!" });
      }
      if (post.creator.toString() !== req.userData.userId) {
        return res.status(401).json({ message: "Not authorized!" });
      }

      Post.updateOne(
        { _id: req.params.id, creator: req.userData.userId },
        post
      ).then(result => {
        if (result.modifiedCpunt > 0) {
          res.status(200).json({ message: "Update successful!" });
        } else {
          res.status(401).json({ message: "Not authorized!" });
        }
      });


    });

    const post = new Post({
      _id: req.body.id,
      title: req.body.title,
      movie: req.body.movie,
      content: req.body.content,
      rating: req.body.rating,
      imagePath: imagePath,
      _creator: req.userData.userId,
      userName: req.body.userName
    });

  }
);

router.get("", (req, res, next) => {
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const postQuery = Post.find();
  let fetchedPosts;
  if (pageSize && currentPage) {
    postQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
  }
  postQuery
    .then(documents => {
      fetchedPosts = documents;
      return Post.count();
    })
    .then(count => {
      res.status(200).json({
        message: "Posts fetched successfully!",
        posts: fetchedPosts,
        maxPosts: count
      });
    });
});

router.get("/:id", (req, res, next) => {
  Post.findById(req.params.id).then(post => {
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({ message: "Post not found!" });
    }
  });
});

router.delete("/:id", checkAuth, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found!" });
    }

    const postCreatorUserId = post.creator.toString();

    if (postCreatorUserId !== req.userData.userId) {
      console.log(postCreatorUserId, req.userData.userId);
      return res.status(401).json({ message: "Not authorized!" });
    }

    await Post.findByIdAndDelete({ _id: post._id });

    res.status(200).json({ message: "Post deleted successfully." });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "An error occurred while deleting the post." });
  }
});

router.get("/user/:userId", (req, res, next) => {
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const userId = req.params.userId;

  const postQuery = Post.find({ creator: userId });
  let fetchedPosts;

  if (pageSize && currentPage) {
    postQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
  }

  postQuery
    .then(documents => {
      fetchedPosts = documents;
      return Post.countDocuments({ creator: userId });
    })
    .then(count => {
      res.status(200).json({
        message: "Posts fetched successfully!",
        posts: fetchedPosts,
        maxPosts: count
      });
    })
    .catch(error => {
      res.status(500).json({
        message: "Fetching posts failed!"
      });
    });
});


router.delete("/user/:userId", checkAuth, (req, res, next) => {
  const userId = req.params.userId;
  const postId = req.params.postId;

  // Check if the post exists and the user is its creator
  Post.findOneAndDelete({ id: postId, creator: userId })
    .then(post => {
      if (!post) {
        return res.status(404).json({ message: "Post not found or user not authorized to delete." });
      }
      res.status(200).json({ message: "Post deleted successfully." });
    })
    .catch(error => {
      console.error("Error deleting post:", error);
      res.status(500).json({ message: "An error occurred while deleting the post." });
    });
});

module.exports = router;
