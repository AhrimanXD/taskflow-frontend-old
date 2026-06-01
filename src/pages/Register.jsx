import { useState } from "react";
import {
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Group,
  Text,
  Anchor,
  Alert,
} from "@mantine/core";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth-context";
import AuthShell from "../components/AuthShell";

function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();

  function validateForm() {
    const newErrors = {};
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email))
      newErrors.email = "Invalid email format";
    if (username.length < 3)
      newErrors.username = "Username must be atleast 3 chars";
    if (password.length < 6)
      newErrors.password = "Password must be atleast 6 chars";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    if (!validateForm()) {
      setLoading(false);
      return;
    }
    try {
      await register(username, email, password);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      const detail = error?.response?.data?.detail;
      setErrors({ form: detail || "Registration failed. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start organizing work with your team."
    >
      <form onSubmit={handleSubmit} noValidate>
        <Stack gap="md">
          {errors.form && (
            <Alert color="red" variant="light" radius="md">
              {errors.form}
            </Alert>
          )}
          <TextInput
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            size="md"
            error={errors.email}
            required
          />
          <TextInput
            label="Username"
            placeholder="yourusername"
            value={username}
            onChange={(e) => setUsername(e.currentTarget.value)}
            size="md"
            error={errors.username}
            required
          />
          <PasswordInput
            label="Password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            size="md"
            error={errors.password}
            required
          />
          <Button type="submit" fullWidth size="md" mt="xs" loading={loading}>
            Create account
          </Button>
        </Stack>
      </form>

      <Group justify="center" gap={6}>
        <Text c="dimmed" size="sm">
          Already have an account?
        </Text>
        <Anchor component={Link} to="/login" size="sm" fw={500}>
          Sign in
        </Anchor>
      </Group>
    </AuthShell>
  );
}

export default Register;
