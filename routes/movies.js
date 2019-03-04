const express = require('express');
const { Movie, validate } = require('../models/movie');
const { Genre } = require('../models/genre');
const router = express.Router();

// GET ALL
router.get('/', async (req, res) => {
    const movies = await Movie.find().sort('name');
    res.send(movies);
})

// GET BY ID
router.get('/:id', async (req, res) => {
    const movie = await Movie.findById(req.params.id);

    if (!movie) return res.status(404).send('The movie with the given ID was not found.');

    res.send(movie);
});

// CREATE
router.post('/', async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details.map(d => d.message).join(', '));

    const genre = await Genre.findById(req.body.genreId);
    if (!genre) return res.status(400).send('Invalide genre.');

    const movie = new Movie({
        name: req.body.name,
        genre: { _id: genre._id, name: genre.name },
        numberInStock: req.body.numberInStock,
        dailyRentalRate: req.body.dailyRentalRate
    });

    await movie.save();

    res.send(movie);
});

// UPDATE
router.put('/:id', async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details.map(d => d.message).join(', '));

    const genre = await Genre.findById(req.body.genreId);
    if (!genre) return res.status(400).send('Invalide genre.');

    const movie = await Movie.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        genre: { _id: genre._id, name: genre.name },
        numberInStock: req.body.numberInStock,
        dailyRentalRate: req.body.dailyRentalRate
    }, { new: true }); // Returns the newly updated model instead of the original

    if (!movie) return res.status(404).send('The movie with the given ID was not found.');

    res.send(movie);
});

// DELETE
router.delete('/:id', async (req, res) => {
    const movie = await Movie.findByIdAndRemove(req.params.id);

    if (!movie) return res.status(404).send('The movie with the given ID was not found.');

    res.send(movie);
});

module.exports = router;