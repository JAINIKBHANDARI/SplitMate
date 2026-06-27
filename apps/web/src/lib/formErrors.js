export function fieldErrorsFrom(issue) {
  const errors = {};
  for (const item of issue?.fieldErrors ?? issue?.details ?? []) {
    if (!item?.field) continue;
    errors[item.field] = item.message;
  }
  return errors;
}

export function firstFieldError(errors) {
  return Object.keys(errors).find((key) => key !== "form");
}

export function focusFirstInvalid(form, errors) {
  const field = firstFieldError(errors);
  if (!field || !form) return;
  const input = form.querySelector(`[name="${CSS.escape(field)}"]`);
  input?.focus();
  input?.scrollIntoView({ behavior: "smooth", block: "center" });
}

export function errorFor(errors, field) {
  return errors[field];
}
