const rateLimit = require('express-rate-limit');

function make(max, windowMinutes, message) {
    return rateLimit({
        windowMs:         windowMinutes * 60 * 1000,
        max,
        standardHeaders:  true,
        legacyHeaders:    false,
        message:          { error: true, code: 'RATE_LIMITED', message }
    });
}

module.exports = {
    calculate: make(100, 60, 'Too many calculations — try again in an hour.'),
    login:     make(10,  60, 'Too many login attempts — try again in an hour.'),
    signup:    make(5,   60, 'Too many signup attempts — try again in an hour.')
};
