---
trigger: always_on
---

---
name: engineering-standards
description: Permanent engineering standards for implementation, architecture, testing, security, maintainability, and code quality.
---

# Engineering Standards

These rules apply to every implementation task in this repository.

## SOLID

Apply SOLID principles pragmatically to all non-trivial code.

### Single Responsibility
Each module, service, component, function, hook, and class must have a clear responsibility.

### Open/Closed
Prefer designs that can accommodate genuinely required extensions without repeatedly modifying stable core logic.

### Liskov Substitution
Implementations of an abstraction must preserve its behavioral contract.

### Interface Segregation
Keep interfaces focused on the needs of their consumers.

### Dependency Inversion
Separate business/domain logic from infrastructure details when a meaningful boundary is required.

## Anti-Overengineering

Follow YAGNI and Ponytail principles.

Before creating new code, abstraction, dependency, service, utility, or wrapper:

1. Search the existing codebase.
2. Check for reusable existing functionality.
3. Check framework/native capabilities.
4. Check existing dependencies.
5. Add new complexity only when justified.

Do not create speculative abstractions.

## Testing

Meaningful business behavior must be testable.

Test:
- happy paths
- invalid input
- edge cases
- failure paths
- security boundaries
- important business calculations

## Security

Never expose secrets, credentials, or private user information.

Validate user input.

Enforce authorization server-side.

Never trust user-provided coding statistics.

## Specification Compliance

Do not implement product behavior that is not present in the active specification.

For this project, do not introduce:
- Question of the Week
- First Blood
- Batch Wars
- enrollment number
- roll number
- section
- college-email-only registration

unless the specification is explicitly changed.

## Simplicity

Prefer the smallest correct implementation.

Do not perform unrelated refactoring.

Do not introduce abstractions solely to satisfy a design principle.

## Completion

Before declaring implementation complete:

- run relevant tests
- run type checking
- run linting where applicable
- inspect the diff
- verify against the active specification
- verify security/privacy requirements
- verify no unnecessary complexity was introduced