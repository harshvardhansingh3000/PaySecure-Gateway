export const registerUser = (req, res) => {
  const { name, email, password } = req.body;
  // For now, just echo back the data (we’ll add DB logic later)
  res.status(201).json({
    message: 'User registered successfully (mock)',
    user: { name, email }
  });
};  