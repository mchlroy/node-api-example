const express = require('express');
const mongoose = require('mongoose');
const Fawn = require('fawn');
const { Rental, validate } = require('../models/rental');
const { Customer } = require('../models/customer');
const { Movie } = require('../models/movie');
const router = express.Router();

// For transactions
Fawn.init(mongoose);

// GET ALL
router.get('/', async (req, res) => {
    const rentals = await Rental.find().sort('-dateOut');
    res.send(rentals);
})

// GET BY ID
router.get('/:id', async (req, res) => {
    const rental = await Rental.findById(req.params.id);

    if (!rental) return res.status(404).send('The rental with the given ID was not found.');

    res.send(rental);
});

// CREATE
router.post('/', async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details.map(d => d.message).join(', '));

    const customer = await Customer.findById(req.body.customerId);
    if (!customer) return res.status(400).send('Invalid customer.');

    const movie = await Movie.findById(req.body.movieId);
    if (!movie) return res.status(400).send('Invalid movie.');

    if (movie.numberInStock === 0) return res.status(400).send('Movie not in stock');

    let rental = new Rental({
        customer: {
            _id: customer._id,
            name: customer.name,
            phone: customer.phone
        },
        movie: {
            _id: movie._id,
            title: movie.title,
            dailyRentalRate: movie.dailyRentalRate
        }
    });

    try {
        new Fawn.Task()
            .save('rentals', rental)
            .update('movies', { _id: movie._id }, {
                $inc: { numberInStock: -1 }
            })
            .run();

        res.send(rental);
    }
    catch (ex) {
        res.status(500).send('Something failed.');
    }
});

// UPDATE
router.put('/:id', async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details.map(d => d.message).join(', '));

    const customer = await Customer.findById(req.body.customerId);
    if (!customer) return res.status(400).send('Invalide customer.');

    const rental = await Rental.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        customer: { _id: customer._id, name: customer.name },
        numberInStock: req.body.numberInStock,
        dailyRentalRate: req.body.dailyRentalRate
    }, { new: true }); // Returns the newly updated model instead of the original

    if (!rental) return res.status(404).send('The rental with the given ID was not found.');

    res.send(rental);
});

// DELETE
router.delete('/:id', async (req, res) => {
    const rental = await Rental.findByIdAndRemove(req.params.id);

    if (!rental) return res.status(404).send('The rental with the given ID was not found.');

    res.send(rental);
});

module.exports = router;