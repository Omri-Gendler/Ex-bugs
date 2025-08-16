import { useState } from 'react';
import { authService } from '../services/auth.service';

export function Signup({ onSignup }) {
  const [userInfo, setUserInfo] = useState({ username: '', password: '', fullname: '' });

  function handleChange(ev) {
    const { name, value } = ev.target;
    setUserInfo(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    const user = await authService.signup(userInfo);
    if (user) onSignup(user);
    // TODO: handle signup error
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="username" value={userInfo.username} onChange={handleChange} placeholder="Username" />
      <input name="fullname" value={userInfo.fullname} onChange={handleChange} placeholder="Full Name" />
      <input name="password" type="password" value={userInfo.password} onChange={handleChange} placeholder="Password" />
      <button type="submit">Sign Up</button>
    </form>
  );
}
