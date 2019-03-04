const mongoose = require('mongoose');
const Joi = require('joi');

const phoneRegex = /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/;

const Customer = mongoose.model('Customer', new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50
    },
    phone: {
        type: String,
        required: true,
        validate: v => {
            return phoneRegex.test(v);
        }   
    },
    isGold: {
        type: Boolean,
        required: true,
        default: false
    }
}));

// VALIDATIONS
function validateCustomer(customer) {
    const schema = {
        name: Joi.string().min(3).max(50).required(),
        phone: Joi.string().required().regex(phoneRegex),
        isGold: Joi.boolean()
    }

    const result = Joi.validate(customer, schema);
    return result;
}

exports.Customer = Customer;
exports.validate = validateCustomer;