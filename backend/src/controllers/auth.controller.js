const authService = require('../services/auth.service');

const register = async (request, reply) => {
    const newUser = await authService.register(request.body);
    const { token, data } = authService.createSendToken(newUser);
    
    return {
        status: 'success',
        token,
        data: {
            user: data.user,
        },
    };
};

const login = async (request, reply) => {
    const { email, password } = request.body;
    
    // 1) Check if email and password exist
    if (!email || !password) {
        throw new AppError('Please provide email and password!', 400);
    }
    
    // 2) Check if user exists && password is correct
    const user = await authService.login(email, password);
    const { token, data } = authService.createSendToken(user);
    console.log(token);
    
    // 3) Send response with token and user data
    return {
        status: 'success',
        token,
        data: {
            user: data.user,
        },
    };
};

const protect = async (request, reply) => {
    return await authService.protect(request, reply);
};

const restrictTo = (...roles) => {
    return authService.restrictTo(...roles);
};

module.exports = {
    register,
    login,
    protect,
    restrictTo,
};
