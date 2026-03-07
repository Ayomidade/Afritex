import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";

export const registerUser = async (req, res, next) => {
  try {
    const { name, username, email, password, role } = req.body;
    if (!name || !username || !email || !password) {
      return res
        .status(400)
        .json({ status: "Error", message: "All fields are required." });
    }

    const existingUser = null;
    if (existingUser) {
      return res
        .status(400)
        .json({ status: "Error", message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // console.log(hashedPassword)

    const newUser = {
      id: Date.now(),
      name,
      username,
      email,
      password: hashedPassword,
      role: role || "Customer",
    };

    const token = JWT.sign(
      { id: newUser.id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "4d" },
    );

    res.status(201).json({
      status: "Success",
      message: "User registered successfully",
      user: newUser,
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      const error = new Error("All fields are required.");
      error.statusCode = 400;
      throw(error)
      // return res
      //   .status(400)
      //   .json({ status: "Error", message: "All fields are required." });
    }

    const user = {
      id: Date.now(),
      name: "John Doe",
      username: "johndoe",
      email: "john@doe.com",
      password: await bcrypt.hash("123456789", 10),
      role: "Customer",
    };

    const isMatch = await bcrypt.compare(password, user.password);

    if (username !== user.username || !isMatch) {
      return res
        .status(400)
        .json({ status: "Error", message: "Invalid credentials." });
    }

    const token = JWT.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "4d" },
    );

    res.status(200).json({
      status: "Success",
      message: "Login successful.",
      data: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};
