# Copilot Instructions for Invoice System

- Work through each checklist item systematically.
- Keep communication concise and focused.
- Follow development best practices.

## Project Requirements
- Next.js (App Router, TypeScript)
- React
- Firebase (Auth, Firestore, Security Rules)
- Tailwind CSS
- Vercel compatible
- Robust print system (no iframe/localStorage hacks, pixel-perfect, PDF/print/preview from same React component)
- Authentication with roles (Admin/User)
- Business dashboard
- Invoice and return/credit note system
- Address book
- Excel (.xlsx) export
- Production-stable, clean architecture, strict security

## Execution Guidelines
- Use '.' as the working directory unless user specifies otherwise.
- Do not create a new folder unless the user explicitly requests it.
- Only install extensions specified by the get_project_setup_info tool.
- Avoid verbose explanations or printing full command outputs.
- If a step is skipped, state that briefly.
- Do not explain project structure unless asked.
- Keep explanations concise and focused.
- Use placeholders only with a note that they should be replaced.
- Ensure all generated components serve a clear purpose within the user's requested workflow.
- If a feature is assumed but not confirmed, prompt the user for clarification before including it.
- Your task is complete when:
  - Project is successfully scaffolded and compiled without errors
  - copilot-instructions.md file in the .github directory exists in the project
  - README.md file exists and is up to date
  - User is provided with clear instructions to debug/launch the project
