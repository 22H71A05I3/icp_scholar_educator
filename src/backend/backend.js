import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory, canisterId } from "../../declarations/icp_scholar_core_backend_backend";

// Localhost agent (for local dfx)
const agent = new HttpAgent({ host: "http://localhost:4943" });

if (process.env.DFX_NETWORK !== "ic") {
  // Needed to communicate with local replica
  agent.fetchRootKey().catch((err) => {
    console.warn("⚠️ Unable to fetch root key. Is the replica running?");
    console.error(err);
  });
}

// Create the actor
const backend = Actor.createActor(idlFactory, {
  agent,
  canisterId,
});

export { backend };
