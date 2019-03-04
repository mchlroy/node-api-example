const express = require('express');
const { Genre, validate } = require('../models/genre');
const auth = require('../middlewares/auth');
const admin  = require('../middlewares/admin');
const validateObjectId  = require('../middlewares/validateObjectId');
const router = express.Router();

// GET ALL
router.get('/', async (req, res) => {
    const genres = await Genre.find().sort('name');
    res.send(genres);
});

// GET BY ID
router.get('/:id', validateObjectId, async (req, res) => {
    const genre = await Genre.findById(req.params.id);
    if (!genre) return res.status(404).send('The genre with the given ID was not found.');
    res.send(genre);
});

// CREATE
router.post('/', auth, async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details.map(d => d.message).join(', '));

    let genre = new Genre({ name: req.body.name });
    genre = await genre.save();

    res.send(genre);
});

// UPDATE
router.put('/:id', [auth, admin], async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details.map(d => d.message).join(', '));

    const genre = await Genre.findByIdAndUpdate(req.params.id, { name: req.body.name }, {
        new: true       // Returns the newly updated model instead of the original
    });

    if (!genre) return res.status(404).send('The genre with the given ID was not found.');

    res.send(genre);
});

// DELETE
router.delete('/:id', [auth, admin], async (req, res) => {
    const genre = await Genre.findByIdAndRemove(req.params.id);
    
    if (!genre) return res.status(404).send('The genre with the given ID was not found.');

    res.send(genre);
});

module.exports = router;