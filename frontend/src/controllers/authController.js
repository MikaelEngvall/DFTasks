import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { validateEmail, validatePassword, validateAuthInput } from "../utils/validation.js";
import { ErrorHandler } from '../utils/errorHandler';
import { TokenService } from '../services/TokenService';
import { UserService } from '../services/UserService';
import { jwtDecode } from "jwt-decode";

class AuthController {
  constructor() {
    this.tokenService = new TokenService();
    this.userService = new UserService();
    this.token = localStorage.getItem('token');
  }

  async login(credentials) {
    try {
      // Validera input
      const validation = validateAuthInput(credentials.email, credentials.password);
      if (!validation.isValid) {
        throw new Error(Object.values(validation.errors).join(', '));
      }

      // Autentisera användare
      const user = await this.userService.authenticate(credentials);
      if (!user) {
        throw new Error('Ogiltiga inloggningsuppgifter');
      }

      // Generera tokens
      const { accessToken, refreshToken } = await this.tokenService.generateTokens(user);

      // Spara refresh token
      await this.userService.saveRefreshToken(user.id, refreshToken);

      return {
        user: this.sanitizeUser(user),
        accessToken,
        refreshToken
      };
    } catch (error) {
      return ErrorHandler.handle(error, 'auth.login.failed');
    }
  }

  async refreshToken(token) {
    try {
      const newTokens = await this.tokenService.refreshAccessToken(token);
      if (!newTokens) {
        throw new Error('Ogiltig refresh token');
      }
      return newTokens;
    } catch (error) {
      return ErrorHandler.handle(error, 'auth.token.refresh.failed');
    }
  }

  async logout(userId) {
    try {
      await this.userService.removeRefreshToken(userId);
      return { success: true };
    } catch (error) {
      return ErrorHandler.handle(error, 'auth.logout.failed');
    }
  }

  generateToken(user) {
    return jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        preferredLanguage: user.preferredLanguage,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1d" }
    );
  }

  sanitizeUser(user) {
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      preferredLanguage: user.preferredLanguage
    };
  }

  isAuthenticated() {
    if (!this.token) return false;
    try {
      const decoded = jwtDecode(this.token);
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  getToken() {
    return this.token;
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  getUser() {
    if (!this.token) return null;
    try {
      return jwtDecode(this.token);
    } catch {
      return null;
    }
  }
}

export default new AuthController(); 