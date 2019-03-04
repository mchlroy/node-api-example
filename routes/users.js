const express = require('express');
const { User, validate } = require('../models/user');
const auth = require('../middlewares/auth');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('config');
const router = express.Router();

// Logged in user informations
router.get('/me', auth, async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    res.send(user);
});

// GET ALL
router.get('/', async (req, res) => {
    const users = await User.find().sort('name');
    res.send(users);
})

// GET BY ID
router.get('/:id', async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).send('The user with the given ID was not found.');

    res.send(user);
});

// REGISTER
router.post('/', async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details.map(d => d.message).join(', '));

    let user = await User.findOne({email: req.body.email});
    if (user) return res.status(400).send('User already registered');

    user = new User(_.pick(req.body, ['name', 'email', 'password']));

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    await user.save();
    
    const token = user.generateAuthToken();
    res.header('x-auth-token', token).send(_.pick(user, ['_id', 'name', 'email']));
});

// UPDATE
router.put('/:id', auth, async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details.map(d => d.message).join(', '));

    const emailNotUnique = await User.findOne({email: req.body.email, _id: {
        $ne: req.params.id
    }});
    console.log(emailNotUnique);
    if (emailNotUnique) return res.status(400).send('Email already used.');

    user = _.pick(req.body, ['name', 'email', 'password']);

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    user = await User.findByIdAndUpdate(req.params.id, user, { new: true });
    if (!user) return res.status(404).send('The user with the given ID was not found.');

    res.send(user);
});

// DELETE
router.delete('/:id', async (req, res) => {
    const user = await User.findByIdAndRemove(req.params.id);

    if (!user) return res.status(404).send('The user with the given ID was not found.');

    res.send(user);
});

module.exports = router;