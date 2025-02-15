import jwt from 'jsonwebtoken';

export class TokenService {
  constructor() {
    this.accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
    this.refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
  }

  async generateTokens(user) {
    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      this.accessTokenSecret,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      this.refreshTokenSecret,
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
  }

  async refreshAccessToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, this.refreshTokenSecret);
      
      // Generera ny access token
      const accessToken = jwt.sign(
        { id: decoded.id },
        this.accessTokenSecret,
        { expiresIn: '15m' }
      );

      return { accessToken };
    } catch (error) {
      return null;
    }
  }

  verifyToken(token, isRefreshToken = false) {
    try {
      const secret = isRefreshToken ? this.refreshTokenSecret : this.accessTokenSecret;
      return jwt.verify(token, secret);
    } catch (error) {
      return null;
    }
  }
} 