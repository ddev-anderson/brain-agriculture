import { TaxId } from '../document.vo';
import { ValidationDomainError } from '../../errors/domain.error';

describe('Document Value Object', () => {
  // ─── Valid CPF ─────────────────────────────────────────────────────────────

  describe('valid CPF', () => {
    it('accepts a valid CPF (digits only)', () => {
      const taxId = new TaxId('52998224725');
      expect(taxId.value).toBe('52998224725');
      expect(taxId.isCpf()).toBe(true);
      expect(taxId.isCnpj()).toBe(false);
    });

    it('strips formatting before validating CPF', () => {
      const taxId = new TaxId('529.982.247-25');
      expect(taxId.value).toBe('52998224725');
    });

    it('accepts another valid CPF', () => {
      const taxId = new TaxId('11144477735');
      expect(taxId.value).toBe('11144477735');
    });

    it('toString returns the raw digits', () => {
      const taxId = new TaxId('52998224725');
      expect(taxId.toString()).toBe('52998224725');
    });
  });

  // ─── Invalid CPF ───────────────────────────────────────────────────────────

  describe('invalid CPF', () => {
    it.each(['00000000000', '11111111111', '22222222222', '99999999999'])(
      'throws for CPF with all identical digits (%s)',
      cpf => {
        expect(() => new TaxId(cpf)).toThrow(ValidationDomainError);
      },
    );

    it('throws for CPF with wrong first check digit', () => {
      // last two digits changed: 25 → 15
      expect(() => new TaxId('52998224715')).toThrow(ValidationDomainError);
    });

    it('throws for CPF with wrong second check digit', () => {
      // last digit changed: 5 → 4
      expect(() => new TaxId('52998224724')).toThrow(ValidationDomainError);
    });

    it('throws for CPF with sequential digits', () => {
      expect(() => new TaxId('12345678901')).toThrow(ValidationDomainError);
    });
  });

  // ─── Valid CNPJ ────────────────────────────────────────────────────────────

  describe('valid CNPJ', () => {
    it('accepts a valid CNPJ (digits only)', () => {
      const taxId = new TaxId('11222333000181');
      expect(taxId.value).toBe('11222333000181');
      expect(taxId.isCnpj()).toBe(true);
      expect(taxId.isCpf()).toBe(false);
    });

    it('strips formatting before validating CNPJ', () => {
      const taxId = new TaxId('11.222.333/0001-81');
      expect(taxId.value).toBe('11222333000181');
    });
  });

  // ─── Invalid CNPJ ──────────────────────────────────────────────────────────

  describe('invalid CNPJ', () => {
    it.each(['00000000000000', '11111111111111', '99999999999999'])(
      'throws for CNPJ with all identical digits (%s)',
      cnpj => {
        expect(() => new TaxId(cnpj)).toThrow(ValidationDomainError);
      },
    );

    it('throws for CNPJ with wrong first check digit', () => {
      // correct last two digits of 11222333000181 are 81; changing to 91
      expect(() => new TaxId('11222333000191')).toThrow(ValidationDomainError);
    });

    it('throws for CNPJ with wrong second check digit', () => {
      // changing last digit from 1 to 2
      expect(() => new TaxId('11222333000182')).toThrow(ValidationDomainError);
    });
  });

  // ─── Wrong length ──────────────────────────────────────────────────────────

  describe('invalid length', () => {
    it('throws for an empty string', () => {
      expect(() => new TaxId('')).toThrow(ValidationDomainError);
    });

    it('throws for a 10-digit value (one short of CPF)', () => {
      expect(() => new TaxId('1234567890')).toThrow(ValidationDomainError);
    });

    it('throws for a 12-digit value (between CPF and CNPJ)', () => {
      expect(() => new TaxId('123456789012')).toThrow(ValidationDomainError);
    });

    it('throws for a 15-digit value (one over CNPJ)', () => {
      expect(() => new TaxId('112223330001810')).toThrow(ValidationDomainError);
    });

    it('error message describes the expected format', () => {
      expect(() => new TaxId('123')).toThrow(
        'Document must be a valid CPF (11 digits) or CNPJ (14 digits).',
      );
    });
  });
});
