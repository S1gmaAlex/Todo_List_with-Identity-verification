const mongoose = require('mongoose');
const { isEmail } = require('validator')
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        require: [true, 'pls enter email'],
        unique: true,
        validate: [isEmail, 'pls enter a valid email']
    },
    password: {
        type: String,
        require: [true, 'pls enter password'],
        maxLength: [20, 'maximum username length is 20 character']
    },
    todo: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "todo",
            require: true,
        }
    ],
    task: [
        {
            type: mongoose.Schema.Types.String,
            ref: "todo",
            require: true,
        }
    ]
});

const todoSchema = new mongoose.Schema({
    title: {
        type: mongoose.Schema.Types.String,
        ref: "user",
        require: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        require: true,
    }
})

// fire a function after doc saved to db
userSchema.post('save', function (doc, next) {
    console.log('new user was created and saved', doc);
    next();
});

// fire a function before doc saved to db
userSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);

    console.log('user about to be created and saved', this);
    next();
});

// static method to login user
userSchema.statics.login = async function (email, password) {
    const user = await this.findOne({ email });
    if (user) {
        const auth = await bcrypt.compare(password, user.password);
        if (auth) {
            return user;
        }
        throw Error('incorrect password');
    }
    throw Error('incorrect email');
};

const User = mongoose.model('user', userSchema);
const Todo = mongoose.model('todo', todoSchema);
module.exports = { User, Todo };
