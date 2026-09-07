function Register() {
  return (
    <div>
      <h1>Create BugHunter Account</h1>

      <form>
        <div>
          <label>Name</label>
          <br />
          <input
            type="text"
            placeholder="Enter your name"
          />
        </div>

        <br />

        <div>
          <label>Email</label>
          <br />
          <input
            type="email"
            placeholder="Enter your email"
          />
        </div>

        <br />

        <div>
          <label>Password</label>
          <br />
          <input
            type="password"
            placeholder="Create a password"
          />
        </div>

        <br />

        <div>
          <label>Role</label>
          <br />
          <select>
            <option value="tester">Tester</option>
            <option value="developer">Developer</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <br />

        <button type="submit">
        Register
        </button>
    </form>
</div>
);

}

export default Register;