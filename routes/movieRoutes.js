const express = require("express");
// const path = require("path");
const router = express.Router();
const axios = require("axios");
const util = require("../data/utils/util");
const movieData = require("../data/movie/movie");
const commentData = require("../data/movie/comment");

// router.get("", async (req, res) => {
//   console.log(123123123123);
//   const { data } = await axios.get(
//     `https://imdb-api.com/en/API/Title/k_o8ajco4w/tt0068646`
//   );
//   // res.render("movie/movieDetails", { data: data });
//   res.render("movie/movieDetails", {});
// });

router.get("/addMovie", (req, res) => {
  //auth is Login?

  res.render("movie/addMovie", {});
});

router.get("/:id", async (req, res) => {
  let id = req.params.id;
  try {
    id = util.isObjectId(id);
  } catch (error) {
    res.status(400).json({ error: error });
  }

  try {
    const movie = await movieData.getById(id);
    // movie.releaseDate = movie.releaseDate.getUTCDate();
    // movie.releaseDate = `${movie.releaseDate.getMonth()}/${movie.releaseDate.getDate()}/${movie.releaseDate.getFullYear()}`;
    movie.imageShow = [];
    for (let i = 0; i < 9; i++) {
      const img = movie.images[i];
      movie.imageShow.push(img);
    }
    if (req.session.user)
      res.render("movie/details", {
        movie: movie,
        userName: req.session.user.account,
        CSS: "detail.css",
      }); //
    else res.render("movie/details", { movie: movie, CSS: "detail.css" });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

//search movie
router.post("/search", async (req, res) => {
  try {
    const movieSearch = req.body.search_termInput;
    if (!movieSearch) {
      throw `movie does not exist!`;
    }
    const movie = await movieData.getByName(movieSearch);
    res.send(movie);
  } catch (e) {
    console.log(e);
    res.status(400).render("home/home", {
      login_flag: "movieSearch",
      status: "HTTP 400",
      error: e,
    });
  }
});

//comment
router.post("/comment", async (req, res) => {
  try {
    if (!req.body.content || !req.body.rate)
      throw `content or rate do not exist!`;
    const content = req.body.content;
    util.checkString("content", content);
    //const commentChild = req.body.commentChild;
    const userName = req.body.userName;

    const movieId = req.body.movieId;
    var myDate = new Date();
    const date = myDate.toLocaleDateString();
    const rate = parseFloat(req.body.rate);

    const movie = await movieData.getById(movieId);
    // console.log(rate);

    const comment = await commentData.createComment(
      content,
      userName,
      movieId,
      date,
      rate
    );
    if (comment.commentInserted == true) {
      commentData.calMovieRate(movieId);
      res.render(`movie/details`, {
        movie: movie,
        userName: req.session.user.account,
        CSS: "detail.css",
        comment: true,
      });
    } else {
      throw `Did not comment.`;
    }
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

module.exports = router;
