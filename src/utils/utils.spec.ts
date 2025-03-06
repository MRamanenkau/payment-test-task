import { maskSensitiveData } from './index';

describe('maskSensitiveData', () => {
  it('should mask card_number leaving last 4 digits', () => {
    const input = { card_number: '1234567890123456', name: 'John Doe' };
    const expected = { card_number: '****-****-****-3456', name: 'John Doe' };
    expect(maskSensitiveData(input)).toEqual(expected);
  });

  it('should mask cvc completely', () => {
    const input = { cvc: '123', name: 'John Doe' };
    const expected = { cvc: '***', name: 'John Doe' };
    expect(maskSensitiveData(input)).toEqual(expected);
  });

  it('should mask both card_number and cvc when present', () => {
    const input = { card_number: '1234567890123456', cvc: '123', name: 'John Doe' };
    const expected = { card_number: '****-****-****-3456', cvc: '***', name: 'John Doe' };
    expect(maskSensitiveData(input)).toEqual(expected);
  });

  it('should handle empty object', () => {
    const input = {};
    expect(maskSensitiveData(input)).toEqual({});
  });

  it('should return unchanged object when no sensitive data present', () => {
    const input = { name: 'John Doe', age: 30 };
    expect(maskSensitiveData(input)).toEqual(input);
  });

  it('should handle null input', () => {
    expect(maskSensitiveData(null)).toEqual({});
  });

  it('should handle undefined input', () => {
    expect(maskSensitiveData(undefined)).toEqual({});
  });

  it('should handle short card_number', () => {
    const input = { card_number: '123' };
    const expected = { card_number: '****-****-****-123' };
    expect(maskSensitiveData(input)).toEqual(expected);
  });
});