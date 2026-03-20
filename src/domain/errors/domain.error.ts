export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
    Object.setPrototypeOf(this, DomainError.prototype);
  }
}

export class ValidationDomainError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationDomainError';
    Object.setPrototypeOf(this, ValidationDomainError.prototype);
  }
}

export class NotFoundDomainError extends DomainError {
  constructor(entity: string, id: string) {
    super(`${entity} with id "${id}" was not found.`);
    this.name = 'NotFoundDomainError';
    Object.setPrototypeOf(this, NotFoundDomainError.prototype);
  }
}

export class BusinessRuleViolationError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = 'BusinessRuleViolationError';
    Object.setPrototypeOf(this, BusinessRuleViolationError.prototype);
  }
}
