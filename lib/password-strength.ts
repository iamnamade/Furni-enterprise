export type PasswordStrength = {
  score: number;
  label: "weak" | "medium" | "strong";
  checks: {
    minLength: boolean;
    upper: boolean;
    lower: boolean;
    number: boolean;
    special: boolean;
  };
};

export function evaluatePasswordStrength(password: string): PasswordStrength {
  const checks = {
    minLength: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z\d]/.test(password)
  };

  const score = Object.values(checks).filter(Boolean).length;
  const label: PasswordStrength["label"] = score <= 2 ? "weak" : score <= 4 ? "medium" : "strong";
  return { score, label, checks };
}
