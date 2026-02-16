import { useState } from "react";
import {
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Paper,
  Title,
} from "@mantine/core";
import api from "../services/api.js";

function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

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
    setIsSubmitting(true);
    setErrors({});
    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }
    try {
      const response = await api.post("auth/register", {
        username,
        email,
        password,
      });
      console.log("Succes:", response);
    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        padding: "1rem",
      }}
    >
      <Paper shadow="md" p="xl" withBorder radius="md" w={400}>
        <Title order={2} ta="center" mb="md">
          Register
        </Title>
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
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
              loading={isSubmitting}
            >
              Create Account
            </Button>
          </Stack>
        </form>
      </Paper>
    </div>
  );
}

export default Register;
