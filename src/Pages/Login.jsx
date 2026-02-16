import { useState } from "react";
import {
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Paper,
  Title,
  Center,
} from "@mantine/core";
import api from "../services/api.js";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
  }
  return (
    <Center h="100vh">
      <Paper w={400} shadow="md" p="xl" withBorder radius="md">
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <Title ta="center" order={2}>
              Sign In
            </Title>
            <TextInput
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              size="md"
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
              variant="outline"
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
