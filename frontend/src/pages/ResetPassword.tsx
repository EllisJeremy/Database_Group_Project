import { useNavigate, useSearchParams } from "react-router-dom";
import { PasswordInput, Button, Paper, Title, Container, Stack, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";
import { endpoints } from "../networkUtils";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") ?? "";
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    initialValues: { password: "", confirm: "" },
    validate: {
      password: (v) => (v.length >= 8 ? null : "At least 8 characters"),
      confirm: (v, values) => (v === values.password ? null : "Passwords do not match"),
    },
  });

  async function handleSubmit(values: { password: string }) {
    try {
      await endpoints.resetPassword(token, values.password);
      navigate("/account");
    } catch {
      setError("Invalid or expired reset link.");
    }
  }

  return (
    <Container size={420} py={80}>
      <Title ta="center" mb="xl">
        Set new password
      </Title>
      <Paper withBorder shadow="md" p={30} radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <PasswordInput
              label="New password"
              placeholder="At least 8 characters"
              {...form.getInputProps("password")}
            />
            <PasswordInput
              label="Confirm password"
              placeholder="Repeat your password"
              {...form.getInputProps("confirm")}
            />
            {error && <Text c="red" size="sm">{error}</Text>}
            <Button type="submit" fullWidth>
              Reset password
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
