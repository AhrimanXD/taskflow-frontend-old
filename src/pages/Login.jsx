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

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  function validateForm() {
    const newErrors = {};
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email))
      newErrors.email = "Invalid email";
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
      await login(email, password);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      const detail = error?.response?.data?.detail;
      setErrors({ form: detail || "Login failed. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your account to continue.">
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
          <PasswordInput
            label="Password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            size="md"
            required
          />
          <Button type="submit" fullWidth size="md" mt="xs" loading={loading}>
            Sign in
          </Button>
        </Stack>
      </form>

      <Group justify="center" gap={6}>
        <Text c="dimmed" size="sm">
          Don&apos;t have an account?
        </Text>
        <Anchor component={Link} to="/register" size="sm" fw={500}>
          Create one
        </Anchor>
      </Group>
    </AuthShell>
  );
}

export default Login;
