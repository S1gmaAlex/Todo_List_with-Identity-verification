const { Router } = require('express');
const HomeController = require('../controllers/Controller');

const router = Router();
//Auth 
router.get('/signup', HomeController.signup_get);
router.post('/signup', HomeController.signup_post);
router.get('/login', HomeController.login_get);
router.post('/login', HomeController.login_post);
router.get('/logout', HomeController.logout_get);

//test view
router.get('/viewuser', HomeController.getAllUser);

//Todo
router.post("/todo/create", HomeController.addData);
router.get("/todo/delete/:id", HomeController.deleteData);
router.get("/todo/deleteAll/", HomeController.deleteAll);

module.exports = router;