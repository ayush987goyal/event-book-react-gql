const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../../models/user');

module.exports = {
  createUser: async ({ userInput: { email, password } }) => {
    try {
      const foundUser = await User.findOne({ email });
      if (foundUser) {
        throw new Error('User exists already!');
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const user = new User({ email, password: hashedPassword });
      const savedUser = await user.save();
      return { ...savedUser._doc, password: null, _id: savedUser.id };
    } catch (err) {
      throw err;
    }
  },

  login: async ({ email, password }) => {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('User does not exist!');
      }

      const doesPassMatch = await bcrypt.compare(password, user.password);
      if (!doesPassMatch) {
        throw new Error('Password is incorrect!');
      }

      const token = jwt.sign({ userId: user.id, email }, process.env.JWT_SECRET, {
        expiresIn: '1h'
      });
      return { userId: user.id, token, tokenExpiration: 1 };
    } catch (err) {
      throw err;
    }
  }
};
