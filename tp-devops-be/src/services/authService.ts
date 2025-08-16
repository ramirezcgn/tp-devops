import jwt from 'jsonwebtoken';

const secret =
  process.env.NODE_ENV === 'production' ? process.env.JWT_SECRET : 'secret';

class AuthService {
  issue(payload) {
    return jwt.sign(payload, secret, { expiresIn: 10800 });
  }

  verify(token, cb) {
    return jwt.verify(token, secret, {}, cb);
  }
}

export default new AuthService();
