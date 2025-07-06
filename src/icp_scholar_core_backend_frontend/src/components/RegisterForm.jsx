const handleSubmit = async (e) => {
  e.preventDefault();
  if (!name || !role) {
    setMessage("❗ Please enter all fields.");
    return;
  }

  try {
    // Just pass the role as a plain string
    const result = await backend.register_user(name, role);
    setMessage(`✅ ${result}`);
  } catch (err) {
    console.error(err);
    setMessage("❌ Registration failed: " + err.message);
  }
};
