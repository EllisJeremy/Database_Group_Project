import { useState } from "react";
import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Title,
  Container,
  Tabs,
  Stack,
  Anchor,
  Text,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { createUser } from "../networkUtils";

type Tab = "login" | "signup" | "forgot";

export default function Account() {
  const [tab, setTab] = useState<Tab>("login");

  const loginForm = useForm({
    initialValues: { email: "", password: "" },
    validate: {
      email: (v) => (/^\S+@\S+$/.test(v) ? null : "Invalid email"),
      password: (v) => (v.length > 0 ? null : "Required"),
    },
  });

  const signupForm = useForm({
    initialValues: { name: "", email: "", password: "", confirm: "" },
    validate: {
      name: (v) => (v.trim().length > 0 ? null : "Required"),
      email: (v) => (/^\S+@\S+$/.test(v) ? null : "Invalid email"),
      password: (v) => (v.length >= 8 ? null : "At least 8 characters"),
      confirm: (v, values) => (v === values.password ? null : "Passwords do not match"),
    },
  });

  const forgotForm = useForm({
    initialValues: { email: "" },
    validate: {
      email: (v) => (/^\S+@\S+$/.test(v) ? null : "Invalid email"),
    },
  });

  return (
    <Container size={420} py={80}>
      <Title ta="center" mb="xl">
        {tab === "login"
          ? "Welcome back"
          : tab === "signup"
            ? "Create an account"
            : "Reset your password"}
      </Title>

      {tab === "forgot" ? (
        <Paper withBorder shadow="md" p={30} radius="md">
          <form onSubmit={forgotForm.onSubmit((values) => console.log(values))}>
            <Stack>
              <TextInput
                label="Email"
                placeholder="you@example.com"
                {...forgotForm.getInputProps("email")}
              />
              <Button type="submit" fullWidth>
                Send reset link
              </Button>
              <Anchor component="button" type="button" ta="center" onClick={() => setTab("login")}>
                Back to login
              </Anchor>
            </Stack>
          </form>
        </Paper>
      ) : (
        <Paper withBorder shadow="md" p={30} radius="md">
          <Tabs value={tab} onChange={(v) => setTab(v as Tab)} mb="md">
            <Tabs.List grow>
              <Tabs.Tab value="login">Login</Tabs.Tab>
              <Tabs.Tab value="signup">Sign up</Tabs.Tab>
            </Tabs.List>
          </Tabs>

          {tab === "login" ? (
            <form onSubmit={loginForm.onSubmit((values) => console.log(values))}>
              <Stack>
                <TextInput
                  label="Email"
                  placeholder="you@example.com"
                  {...loginForm.getInputProps("email")}
                />
                <PasswordInput
                  label="Password"
                  placeholder="Your password"
                  {...loginForm.getInputProps("password")}
                />
                <Text ta="right" size="sm">
                  <Anchor component="button" type="button" onClick={() => setTab("forgot")}>
                    Forgot password?
                  </Anchor>
                </Text>
                <Button type="submit" fullWidth>
                  Login
                </Button>
              </Stack>
            </form>
          ) : (
            <form
              onSubmit={signupForm.onSubmit(
                async (values) => await createUser(values.email, values.password, values.name),
              )}
            >
              <Stack>
                <TextInput
                  label="Name"
                  placeholder="Your name"
                  {...signupForm.getInputProps("name")}
                />
                <TextInput
                  label="Email"
                  placeholder="you@example.com"
                  {...signupForm.getInputProps("email")}
                />
                <PasswordInput
                  label="Password"
                  placeholder="At least 8 characters"
                  {...signupForm.getInputProps("password")}
                />
                <PasswordInput
                  label="Confirm password"
                  placeholder="Repeat your password"
                  {...signupForm.getInputProps("confirm")}
                />
                <Button type="submit" fullWidth>
                  Create account
                </Button>
              </Stack>
            </form>
          )}
        </Paper>
      )}
    </Container>
  );
}
