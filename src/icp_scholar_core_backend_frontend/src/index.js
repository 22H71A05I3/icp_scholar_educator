import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory as backend_idl, canisterId as backend_id } from "declarations/backend";

// Create an agent and actor for your canister
const agent = new HttpAgent();
const backend = Actor.createActor(backend_idl, { agent, canisterId: backend_id });

document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const role = document.getElementById("role").value;
  const result = await backend.register_user(name, role);
  document.getElementById("result").innerText = result;
});