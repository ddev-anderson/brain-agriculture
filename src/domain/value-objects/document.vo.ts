import { ValidationDomainError } from '../errors/domain.error';

/**
 * Value Object representing a valid Brazilian CPF (11 digits) or CNPJ (14 digits).
 * Accepts raw strings with or without formatting — strips non-digits automatically.
 * Throws ValidationDomainError when the value fails structural or check-digit validation.
 */
export class TaxId {
  private readonly _value: string;

  constructor(value: string) {
    const digits = value.replace(/\D/g, '');
    this.validate(digits);
    this._value = digits;
  }

  // ─── public API ─────────────────────────────────────────────────────────

  get value(): string {
    return this._value;
  }

  isCpf(): boolean {
    return this._value.length === 11;
  }

  isCnpj(): boolean {
    return this._value.length === 14;
  }

  toString(): string {
    return this._value;
  }

  // ─── private validation ──────────────────────────────────────────────────

  private validate(digits: string): void {
    if (digits.length === 11) {
      this.validateCpf(digits);
    } else if (digits.length === 14) {
      this.validateCnpj(digits);
    } else {
      throw new ValidationDomainError(
        'Document must be a valid CPF (11 digits) or CNPJ (14 digits).',
      );
    }
  }

  private validateCpf(cpf: string): void {
    if (/^(\d)\1+$/.test(cpf)) {
      throw new ValidationDomainError('Invalid CPF: all digits are identical.');
    }

    const mod = (sum: number): number => {
      const r = (sum * 10) % 11;
      return r === 10 || r === 11 ? 0 : r;
    };

    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(cpf[i]) * (10 - i);
    if (mod(sum) !== parseInt(cpf[9])) {
      throw new ValidationDomainError('Invalid CPF.');
    }

    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(cpf[i]) * (11 - i);
    if (mod(sum) !== parseInt(cpf[10])) {
      throw new ValidationDomainError('Invalid CPF.');
    }
  }

  private validateCnpj(cnpj: string): void {
    if (/^(\d)\1+$/.test(cnpj)) {
      throw new ValidationDomainError('Invalid CNPJ: all digits are identical.');
    }

    const calcDigit = (base: string, weights: number[]): number => {
      const sum = base.split('').reduce((acc, d, i) => acc + parseInt(d) * weights[i], 0);
      const r = sum % 11;
      return r < 2 ? 0 : 11 - r;
    };

    if (calcDigit(cnpj.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]) !== parseInt(cnpj[12])) {
      throw new ValidationDomainError('Invalid CNPJ.');
    }
    if (
      calcDigit(cnpj.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]) !== parseInt(cnpj[13])
    ) {
      throw new ValidationDomainError('Invalid CNPJ.');
    }
  }
}
