const express = require('express');
const router = express.Router();
const data = require('../../data');
const usersData = data.users;
const util = require('../../data');
const utilsData = util.utils;

router.get("/", async (req, res) => {
  res.render('users/Info', {
    login_flag: 'login'
  })
});

router.post("/account", async (req, res) => {
  try {
    console.log(req.body.account);
    const users = await usersData.get(req.body.account)
    if (!users)
      throw `account does not exist!`;
    res.render("users/Info", {
      user: users,

    });
  } catch (e) {
    res.status(500).json({
      error: e
    });
  }
});

router.post('/add', async (req, res) => {
  try {
    if (!req.body || !req.body.account || !req.body.confirm || !req.body.password || !req.body.firstName || !req.body.lastName)
      throw 'Missing username or password'
    if (req.body.password != req.body.confirm)
      throw `The two passwords are inconsistent`;

    utilsData.checkAccount(req.body.account);
    utilsData.checkPassword(req.body.password);
    utilsData.checkName(req.body.firstName, req.body.lastName);


    const newUser = await usersData.createUser(
      req.body.account,
      req.body.password,
      req.body.firstName,
      req.body.lastName,
    );

    // console.log(newUser);
    if (newUser.userInserted == true)
      res.render('users/Info', {
        addInfo: 'success'
      });
    else
      res.status(500).send({
        message: 'Internal Server Error'
      })
  } catch (e) {
    console.log(e);
    res.status(400).render('users/Info', {
      addInfo: 'fail',
      status: 'HTTP 400',
      error: e
    })
  }
});

router.post('/update', async (req, res) => {
  let updatedData = await usersData.get(req.body.account);
  try {
    if (!req.body.password && !req.body.lastName && !req.body.firstName)
      throw 'Missing Information';
    if (req.body.password)
      updatedData.password = req.body.password;
    if (req.body.firstName)
      updatedData.firstName = req.body.firstName;
    if (req.body.lastName)
      updatedData.lastName = req.body.lastName;


    utilsData.checkPassword(updatedData.password);
    utilsData.checkString('password', updatedData.password);
    utilsData.checkString('firstName', updatedData.firstName);
    utilsData.checkString('lastName', updatedData.lastName);

    const updatedUsers = await usersData.update(req.body.account, updatedData.password, updatedData.firstName, updatedData.lastName);
    // console.log(updatedUsers);
    if (updatedUsers) {
      // res.redirect('/users');
      res.status(400).render('users/Info', {
        updateInfo: 'success',
        user: updatedUsers
      })
    } else
      res.status(500).send({
        message: 'Internal Server Error'
      })
    // res.render('users/account', {
    //   user: updatedUsers
    // })
  } catch (e) {
    console.log(e);
    res.status(400).render('users/Info', {
      updateInfo: 'fail',
      status: 'HTTP 400',
      error: e
    })
  }
});

router.post('/remove', async (req, res) => {
  try {
    if (!req.body.account)
      throw 'Missing username'

    utilsData.checkAccount(req.body.account);


    const newUser = await usersData.remove(req.body.account);

    // console.log(newUser);
    if (newUser.userDeleted == true)
      res.render('users/Info', {
        removeInfo: 'success'
      });
    else
      res.status(500).send({
        message: 'Internal Server Error'
      })
  } catch (e) {
    console.log(e);
    res.status(400).render('users/Info', {
      removeInfo: 'fail',
      status: 'HTTP 400',
      error: e
    })
  }
});

module.exports = router;