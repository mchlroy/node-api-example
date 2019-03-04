const express = require('express');
const auth = require('../middlewares/auth');
const router = express.Router();
const { Customer, validate }  = require('../models/customer');

// GET ALL
router.get('/', async (req, res) => {
    const customers = await Customer.find().sort('name');
    res.send(customers);
})

// GET BY ID
router.get('/:id', async (req, res) => {
    const customer = await Customer.findById(req.params.id);

    if (!customer) return res.status(404).send('The customer with the given ID was not found.');

    res.send(customer);
});

// CREATE
router.post('/', async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details.map(d => d.message).join(', '));

    let customer = new Customer({
        name: req.body.name,
        phone: req.body.phone,
        isGold: req.body.isGold
    });
    customer = await customer.save();

    res.send(customer);
});

// UPDATE
router.put('/:id', async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details.map(d => d.message).join(', '));

    const customer = await Customer.findByIdAndUpdate(req.params.id, { name: req.body.name }, {
        new: true       // Returns the newly updated model instead of the original
    });

    if (!customer) return res.status(404).send('The customer with the given ID was not found.');

    res.send(customer);
});

// DELETE
router.delete('/:id', async (req, res) => {
    const customer = await Customer.findByIdAndRemove(req.params.id);

    if (!customer) return res.status(404).send('The customer with the given ID was not found.');

    res.send(customer);
});

module.exports = router;