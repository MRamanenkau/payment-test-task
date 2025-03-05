export function maskSensitiveData(data: any): any {
  const masked = { ...data };
  if (masked.card_number) {
    masked.card_number = '****-****-****-' + masked.card_number.slice(-4);
  }
  if (masked.cvc) {
    masked.cvc = '***';
  }
  return masked;
}