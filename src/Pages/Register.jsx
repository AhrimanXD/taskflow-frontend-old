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
import { useAuth } from "../context/AuthContext";

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
    <Center h="100vh">
      <Paper shadow="md" p="xl" withBorder radius="md" w={400}>
        <Title order={2} ta="center" mb="md">
          Register
        </Title>
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            {errors.form && (
              <Alert color="red" variant="light">
                {errors.form}
              </Alert>
            )}
            <TextInput
              label="Email"
              value={email}
              placeholder="youremail@example.com"
              withAsterisk
              size="md"
              error={errors.email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              required
            />
            <TextInput
              label="Username"
              value={username}
              placeholder="yourusername"
              withAsterisk
              size="md"
              error={errors.username}
              onChange={(e) => setUsername(e.currentTarget.value)}
              required
            />
            <PasswordInput
              label="Password"
              value={password}
              size="md"
              withAsterisk
              error={errors.password}
              onChange={(e) => setPassword(e.currentTarget.value)}
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
              Create Account
            </Button>
          </Stack>
        </form>
      </Paper>
    </Center>
  );
}

export default Register;
