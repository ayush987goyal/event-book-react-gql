const bcrypt = require('bcryptjs');

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
  }
};
