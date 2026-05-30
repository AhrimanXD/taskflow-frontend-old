import { useState } from "react";
import {
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Paper,
  Title,
  Center,
  Alert,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth-context";

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
    <Center h="100vh">
      <Paper w={400} shadow="md" p="xl" withBorder radius="md">
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <Title ta="center" order={2}>
              Sign In
            </Title>
            {errors.form && (
              <Alert color="red" variant="light">
                {errors.form}
              </Alert>
            )}
            <TextInput
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              size="md"
              error={errors.email}
              required
            />
            <PasswordInput
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              size="md"
              required
            />
            <Button
              type="submit"
              fullWidth
              variant="filled"
              color="black"
              size="md"
              mt="md"
              loading={loading}
            >
              Sign In
            </Button>
          </Stack>
        </form>
      </Paper>
    </Center>
  );
}

export default Login;
