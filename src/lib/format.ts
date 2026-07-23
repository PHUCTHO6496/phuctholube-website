export function formatVND(amount: number | null | undefined) {
  if (amount == null) return "Liên hệ để biết giá";
  return new Intl.NumberFormat("vi-VN").format(amount) + " ₫";
}

export function formatPhoneDisplay(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length !== 10) return phone;
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
}
