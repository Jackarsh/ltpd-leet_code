---
name: solid-engineering
description: Applies and reviews SOLID principles when implementing or refactoring services, components, modules, APIs, database boundaries, external integrations, and other non-trivial code.
---
# Engineering Standards

These rules apply to every coding task in this repository unless a more specific requirement in the project's specification explicitly overrides them.

## SOLID Principles

Apply SOLID principles deliberately throughout the codebase.

### Single Responsibility Principle

Each module, class, function, component, hook, service, and repository should have a clearly defined responsibility.

Do not create classes or modules that simultaneously handle unrelated concerns such as:

* authentication
* database access
* business logic
* API communication
* UI rendering
* validation

Separate responsibilities when doing so materially improves cohesion and testability.

### Open/Closed Principle

Prefer designs that allow new behavior to be added without repeatedly modifying stable core logic.

Use extension points when multiple implementations or future providers are genuinely expected.

Do not create speculative abstraction layers solely for hypothetical future requirements.

### Liskov Substitution Principle

Any implementation of an abstraction must preserve the behavioral contract expected by callers.

Do not create inheritance hierarchies whose subclasses violate the assumptions of the parent abstraction.

Prefer composition when inheritance does not represent a genuine substitutable relationship.

### Interface Segregation Principle

Keep interfaces focused.

Do not force consumers to depend on methods or data they do not use.

Prefer small, purpose-specific interfaces over large catch-all interfaces.

### Dependency Inversion Principle

Business logic should depend on stable abstractions rather than concrete infrastructure where meaningful isolation is required.

Examples:

* ranking logic should not directly depend on a UI component
* business services should not directly contain provider-specific HTTP details
* domain logic should not depend unnecessarily on database implementation details

## SOLID Must Not Become Over-Engineering

Do not introduce abstractions merely to demonstrate SOLID.

Before adding an interface, factory, adapter, repository, base class, or dependency-injection layer, verify that the abstraction provides a real benefit such as:

* multiple implementations
* test isolation
* meaningful separation of responsibility
* external-provider isolation
* significant future extensibility explicitly required by the specification

A one-implementation abstraction with no meaningful boundary should normally remain concrete.

## Existing Code First

Before introducing a new abstraction:

1. Inspect the existing architecture.
2. Search for reusable types, helpers, services, hooks, utilities, and components.
3. Follow established repository conventions.
4. Avoid duplicating existing patterns.

## Specification Has Priority

Do not add behavior that is not required by:

* the active feature specification
* the approved plan
* the constitution
* an explicitly requested change

## Quality Bar

Every meaningful change should consider:

* correctness
* testability
* security
* privacy
* error handling
* performance
* maintainability
* accessibility for UI changes

Do not sacrifice security, validation, error handling, or data integrity merely to reduce code size.

## Before Coding

For non-trivial changes:

1. Understand the relevant specification.
2. Inspect the existing implementation.
3. Identify affected modules.
4. Decide whether the change belongs in an existing abstraction or requires a new one.
5. Implement the smallest design that satisfies the requirement.
6. Run the relevant tests.
7. Review the resulting diff for unnecessary complexity.
