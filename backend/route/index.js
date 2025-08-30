const express = require("express");

const userRouter = require("./Registration/user.route.js"); // user data
const dataRouter = require("./AxiosURLData/axiosdata.route.js"); // api data
const taskRouter = require("./TodoList/taks.route.js");
const branchRouter = require("./LibraryManagement/LibraryBranch/libraryBranch.route");
const librarianRouter = require("./LibraryManagement/Librarian/librarian.route");

const router = express.Router();

const defaultRoutes = [
  {
    path: "/user",
    route: userRouter,
  },
  {
    path: "/data",
    route: dataRouter,
  },
  {
    path: "/task",
    route: taskRouter,
  },
  {
    path: "/branch",
    route: branchRouter,
  },
  {
    path: "/librarian",
    route: librarianRouter,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
