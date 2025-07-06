import React, { useState, useEffect } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { createActor } from 'declarations/backend';
import { canisterId } from 'declarations/backend/index.js';

const network = process.env.DFX_NETWORK;
const identityProvider =
  network === 'ic'
    ? 'https://identity.ic0.app' // Mainnet
    : 'http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:4943'; // Local

const App = () => {
  const [state, setState] = useState({
    actor: undefined,
    authClient: undefined,
    isAuthenticated: false,
    principal: '',
    result: '',
  });

  useEffect(() => {
    updateActor();
  }, []);

  const updateActor = async () => {
    const authClient = await AuthClient.create();
    const identity = authClient.getIdentity();
    const actor = createActor(canisterId, {
      agentOptions: { identity }
    });
    const isAuthenticated = await authClient.isAuthenticated();
    setState((prev) => ({
      ...prev,
      actor,
      authClient,
      isAuthenticated,
      principal: identity.getPrincipal().toString(),
    }));
  };

  const login = async () => {
    await state.authClient.login({
      identityProvider,
      onSuccess: updateActor
    });
  };

  const logout = async () => {
    await state.authClient.logout();
    updateActor();
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const role = e.target.role.value;
    const result = await state.actor.register_user(name, role);
    setState((prev) => ({ ...prev, result }));
  };

  return (
    <div>
      <h1>ICP Scholar</h1>
      {!state.isAuthenticated ? (
        <button onClick={login}>Login with Internet Identity</button>
      ) : (
        <button onClick={logout}>Logout</button>
      )}
      <div>
        <h2>Your principal ID:</h2>
        <p>{state.principal}</p>
      </div>
      <form onSubmit={handleRegister}>
        <input name="name" placeholder="Name" required />
        <select name="role">
          <option value="learner">Learner</option>
          <option value="educator">Educator</option>
        </select>
        <button type="submit">Register</button>
      </form>
      <div>
        <strong>Result:</strong> {state.result}
      </div>
    </div>
  );
};

export default App;