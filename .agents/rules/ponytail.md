---
trigger: always_on
---

---

name: ponytail
description: 'Prevent over-engineering during implementation, refactoring, debugging, architecture, dependency selection, and code review. Prefer existing code, standard-library features, native platform capabilities, and already-installed dependencies before adding abstractions or new dependencies. Use whenever implementing or reviewing code.'
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

# Ponytail

Optimize for the smallest correct implementation.

"Lazy" means efficient and deliberate, not careless.

## Priority Ladder

Before writing new code:

1. Does this behavior actually need to exist?
2. Does the existing codebase already solve this?
3. Does the language standard library solve this?
4. Does the framework or platform already solve this?
5. Does an already-installed dependency solve this?
6. Can the requirement be satisfied with a smaller change?
7. Only then introduce new code or dependencies.

## YAGNI

Do not implement:

* speculative features
* abstractions for hypothetical future requirements
* unused configuration
* unused interfaces
* placeholder architecture
* premature optimization
* unnecessary wrappers

Implement only what the current specification requires.

## Reuse Before Reimplementation

Before creating:

* utility functions
* hooks
* components
* services
* repositories
* validators
* API clients

search the codebase first.

Reuse existing implementations when their behavior and boundaries are appropriate.

## Dependency Discipline

Do not add a dependency for functionality that can reasonably be provided by:

1. existing project code
2. language standard library
3. framework/platform functionality
4. an already-installed dependency

A new dependency requires a real justification.

## Simplicity

Prefer:

* fewer moving parts
* fewer files
* straightforward control flow
* explicit code
* boring code
* established project patterns

Avoid clever implementations that require significant explanation.

## SOLID Compatibility

Ponytail does not override the project's SOLID engineering standard.

However, SOLID does not justify speculative abstractions.

Before adding an interface, factory, strategy, adapter, base class, repository, or dependency-injection layer, identify the concrete problem it solves.

Good reasons include:

* multiple real implementations
* meaningful testing boundary
* external-provider isolation
* clear domain/infrastructure separation
* explicit architecture requirement

Bad reason:

> "SOLID says we should have an interface."

## Safety Exception

Never simplify away:

* input validation
* authentication
* authorization
* privacy controls
* security checks
* error handling
* data-integrity protection
* accessibility
* meaningful automated tests
* required monitoring/logging

Efficiency must never mean unsafe code.

## Known Tradeoffs

When deliberately choosing a simple implementation with a known limitation, document the limitation briefly.

Example:

```ts
// ponytail: linear lookup is sufficient for the current dataset size.
// Replace with indexed lookup if this collection grows substantially.
```

Do not add complexity until the limitation becomes relevant.

## Output Behavior

When coding:

* inspect before adding
* reuse before creating
* delete unnecessary code when discovered
* keep the diff focused
* avoid unrelated refactoring
* do not add dependencies casually
* do not create architecture for hypothetical requirements

The goal is not the fewest lines at any cost.

The goal is the smallest correct, safe, maintainable implementation.

