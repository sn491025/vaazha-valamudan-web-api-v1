# Teaching the AI Assistant Your Project Patterns

This guide helps you teach the assistant about your architecture, folder structures, and coding rules so future code patches follow your conventions.

## How to brief the assistant (TL;DR)

When asking for changes:
- Reference the relevant pattern doc(s), e.g. "Follow docs/patterns/NestModulePattern.md".
- Provide the target module/path and caret location if applicable.
- State hard rules vs. preferences.
- Provide example(s) from the repo it should mirror.

Example request:
> Implement a new feature "notifications" following docs/patterns/NestModulePattern.md.  
> Create a module under src/modules/notifications with controllers, dto, services like src/modules/users/profile.  
> Hard rules: use class-validator for DTOs, spec files next to controllers, barrel index.ts in each module.

## Put your patterns in docs

- docs/patterns/NestModulePattern.md — The main pattern this repo follows (already added).
- docs/patterns/PATTERN_SPEC_TEMPLATE.md — Use this template to add new patterns.

Keep these up-to-date. In requests, reference them explicitly.

## What makes a good pattern spec

Include:
- Intent and scope (what this pattern solves and when to use it)
- Folder structure and naming conventions (with example tree)
- Allowed dependencies and public API
- DTO and validation rules
- Testing placement and structure
- Export/barrel rules
- Edge cases and non-goals
- Do/Don’t checklist
- Migration/Scaffolding steps

## Enforce and automate (optional but recommended)

- Lint rules: Ensure naming and file placement (e.g., controllers live next to dto/services).
- Generators: Nest schematics or simple scripts to scaffold standard structure.
- CI checks: Validate structure and forbid anti-patterns.
- PR template: Ask authors to link the pattern and confirm compliance (added in .github/PULL_REQUEST_TEMPLATE.md).

## Checklist for requests to the assistant

- [ ] Link the pattern doc(s)
- [ ] Name the feature/module and target path
- [ ] State hard constraints (MUST) and preferences (SHOULD)
- [ ] Include one or two in-repo examples to mirror
- [ ] Describe inputs/outputs and endpoints (if applicable)
- [ ] Mention tests and validation expectations
