const { User, Todo } = require('../models/User');
const jwt = require('jsonwebtoken');


const handleErrors = (err) => {
    console.log(err.message, err.code);
    let errors = { email: '', password: '' };

    // duplicate username, email error
    if (err.code === 11000) {
        // errors.username = 'that username is already registered'
        errors.email = 'that email is already registered';
        return errors;
    }

    // incorrect email
    if (err.message === 'incorrect email') {
        errors.email = 'That email is not registered';
    }

    // incorrect password
    if (err.message === 'incorrect password') {
        errors.password = 'That password is incorrect';
    }

    // validation errors
    if (err.message.includes('user validation failed')) {
        // console.log(err);
        Object.values(err.errors).forEach(({ properties }) => {
            // console.log(val);
            // console.log(properties);
            errors[properties.path] = properties.message;
        });
    }
    return errors;
}
const maxTime = 60 * 60 * 24 * 3;
const createToken = (id) => {
    return jwt.sign({ id }, process.env.Secret, {
        expiresIn: maxTime
    })
}
const HomeController = {
    //test view PostMan
    getAllUser: async (req, res) => {
        try {
            const users = await User.find();
            res.status(200).json(users);
        } catch (err) {
            res.status(500).json(err);
        }
    },

    signup_get: (req, res) => {
        res.render('signup');
    },

    signup_post: async (req, res) => {
        const { email, password } = req.body;
        try {
            const user = await User.create({ email, password });
            const token = createToken(user._id);
            res.cookie('jwt', token, { httpOnly: true, maxAge: maxTime * 1000 })
            res.status(201).json({ user: user._id });
        } catch (err) {
            const errors = handleErrors(err);
            res.status(400).json({ errors });
        }
    },

    login_get: (req, res) => {
        res.render('login');
    },

    login_post: async (req, res) => {
        const { email, password } = req.body;

        try {
            const user = await User.login(email, password);
            const token = createToken(user._id);
            res.cookie('jwt', token, { httpOnly: true, maxAge: maxTime * 1000 });
            res.status(200).json({ user: user._id });
        } catch (err) {
            const errors = handleErrors(err);
            res.status(400).json({ errors });
        }
    },

    logout_get: async (req, res) => {
        res.cookie('jwt', '', { maxAge: 1 });
        res.redirect('/');
    },

    addData: async (req, res) => {
        try {
            const token = req.cookies.jwt;
            if (token) {
                jwt.verify(token, process.env.Secret, async (err, decodedToken) => {
                    if (err) {
                        res.locals.user = null;
                    } else {
                        const logginUser = await User.findById(decodedToken.id);
                        const task = await Todo.create({ title: req.body.title, user: logginUser._id });
                        await logginUser.updateOne({ $push: { todo: task._id } });
                        await logginUser.updateOne({ $push: { task: task.title } });
                        res.redirect("/todo");
                    }
                });
            }
        } catch (err) {
            console.log(err)
            res.status(500).json(err);
        }
    },

    deleteData: async (req, res) => {
        // try {
        //     const deletetask = await Todo.findById(req.params.id);
        //     console.log(deletetask.title);
        //     await User.updateMany(
        //         { todo: req.params.id },
        //         {
        //             $pull: { todo: req.params.id }
        //         })
        //     await Todo.findByIdAndDelete(req.params.id);
        //     res.redirect("/todo");
        // } catch (err) {
        //     res.status(500).json(err);
        // }

        try {
            const token = req.cookies.jwt;
            if (token) {
                jwt.verify(token, process.env.Secret, async (err, decodedToken) => {
                    if (err) {
                        res.locals.user = null;
                    } else {
                        const currentUser = await User.findById(decodedToken.id);
                        const deletetask = await Todo.findById(req.params.id);
                        // console.log(deletetask.title);
                        // console.log(currentUser.task);
                        for (let i = 0; i < currentUser.task.length; i++) {
                            if (currentUser.task[i] === deletetask.title) {

                                await currentUser.updateOne({ $pull: { task: currentUser.task[i] } });

                                await User.updateMany({ todo: req.params.id },
                                    {
                                        $pull: { todo: req.params.id }
                                    })
                                await Todo.findByIdAndDelete(req.params.id);
                            }
                        }
                        res.redirect("/todo");
                    }
                });
            }
        } catch (err) {
            console.log(err)
            res.status(500).json(err);
        }
    },

    deleteAll: async (req, res) => {
        try {
            const token = req.cookies.jwt;
            if (token) {
                jwt.verify(token, process.env.Secret, async (err, decodedToken) => {
                    if (err) {
                        res.locals.user = null;
                    } else {
                        const currentUser = await User.findById(decodedToken.id);
                        await Todo.deleteMany({ user: currentUser.id });
                        await currentUser.updateOne({ $set: { todo: [] } });
                        await currentUser.updateOne({ $set: { task: [] } });
                        res.redirect("/todo");
                    }
                });
            }
        } catch (err) {
            console.log(err)
            res.status(500).json(err);
        }
    }


};

module.exports = HomeController;