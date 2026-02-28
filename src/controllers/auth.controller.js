const authService = require("../services/auth.service");
const { successResponse, errorResponse } = require("../utils/response");

exports.registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await authService.register(email, password);

    return successResponse(
      res,
      201,
      "User registered successfully",
      result.user
    );
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};


exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return successResponse(
      res,
      200,
      "Login successful",
      {
        accessToken: result.accessToken,
        user: result.user
      }
    );
  } catch (error) {
    return errorResponse(res, 401, error.message);
  }
};


exports.refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return errorResponse(res, 401, "No refresh token provided");
    }

    const result = await authService.refresh(token);

    return successResponse(
      res,
      200,
      "Access token refreshed",
      { accessToken: result.accessToken }
    );
  } catch (error) {
    return errorResponse(res, 403, error.message);
  }
};

exports.logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    await authService.logout(token);

    res.clearCookie("refreshToken");

    return successResponse(
      res,
      200,
      "Logged out successfully"
    );
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};


exports.initiateGoogle = (req, res) => {
  const url = authService.getGoogleAuthURL();
  return res.redirect(url);
};

exports.googleCallback = async (req, res) => {
  try {
    const { code } = req.query;

    const result = await authService.handleGoogleCallback(code);

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return successResponse(
      res,
      200,
      "Google login successful",
      {
        accessToken: result.accessToken,
        user: result.user
      }
    );
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};


exports.initiateGithub = (req, res) => {
  const url = authService.getGithubAuthURL();
  return res.redirect(url);
};

exports.githubCallback = async (req, res) => {
  try {
    const { code } = req.query;

    const result = await authService.handleGithubCallback(code);

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return successResponse(
      res,
      200,
      "GitHub login successful",
      {
        accessToken: result.accessToken,
        user: result.user
      }
    );
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};