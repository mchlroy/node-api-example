const mongoose = require('mongoose');
const Joi = require('joi');;
const { genreSchema } = require('./genre');

const Movie = mongoose.model('Movie', new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50
    },
    genre: {
        type: genreSchema,
        required: true
    },
    numberInStock: {
        type: Number,
        required: true,
        min: 0,
        max: 255,
        default: 0
    },
    dailyRentalRate: {
        type: Number,
        required: true,
        min: 0,
        max: 255,
        default: 0
    },
}));

// VALIDATIONS
function validateMovie(movie) {
    const schema = {
        name: Joi.string().min(3).max(50).required(),
        numberInStock: Joi.number().min(0).max(255).required(),
        genreId: Joi.objectid().required(),
        dailyRentalRate: Joi.number().min(0).max(255).required()
    }

    const result = Joi.validate(movie, schema);
    return result;
}

exports.Movie = Movie;
exports.validate = validateMovie;