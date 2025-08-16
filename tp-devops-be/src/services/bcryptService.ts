import bcrypt from 'bcrypt';

class BcryptService {
  password(user) {
    const salt = bcrypt.genSaltSync();
    return bcrypt.hashSync(user.password, salt);
  }

  comparePassword(pw, hash) {
    return bcrypt.compareSync(pw, hash);
  }
}

export default new BcryptService();
