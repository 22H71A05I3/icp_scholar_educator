import React, { useState } from "react";
import { HttpAgent, Actor } from "@dfinity/agent";
import { idlFactory, canisterId } from "../../declarations/icp_scholar_core_backend_backend";

// Set up agent and actor
const agent = new HttpAgent({ host: "http://localhost:4943" });
if (process.env.DFX_NETWORK !== "ic") {
  agent.fetchRootKey().catch((err) => {
    console.warn("⚠️ Unable to fetch root key. Is the replica running?");
    console.error(err);
  });
}
const backend = Actor.createActor(idlFactory, { agent, canisterId });

const RegisterForm = () => {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!name || !role) {
    setMessage("❗ Please enter all fields.");
    return;
  }

  try {
    const icpRole = role === "educator" ? "Educator" : "Learner";
    const result = await backend.register_user(name, icpRole);
    setMessage(`✅ ${result}`);
  } catch (err) {
    setMessage(`❌ Registration failed: ${err.message}`);
  }
};

 

  return (
    <main>
      <img src="logo2.svg" alt="ICP Scholar Logo" />
      <h1>Register as Learner or Educator</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Enter your name:</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label htmlFor="role">Select your role:</label>
        <select
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
        >
          <option value="">--Choose role--</option>
          <option value="learner">Learner</option>
          <option value="educator">Educator</option>
        </select>

        <button type="submit">Register</button>
      </form>

      <p style={{ marginTop: "1em", fontWeight: "bold" }}>{message}</p>
    </main>
  );
};

export default RegisterForm;
