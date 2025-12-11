import AuthService from "./auth.service.js";

class AuthController {
  async register(req, res) {
    try {
      const user = await AuthService.register(req.body);
      res.json({
        message: "Registered successfully",
        user,
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async login(req, res) {
    try {
      const result = await AuthService.login(req.body);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

export default new AuthController();
