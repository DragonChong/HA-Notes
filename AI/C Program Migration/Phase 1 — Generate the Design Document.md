I am migrating a C program to a Spring Boot application. 
Both are currently open in my workspace.

Step 1 — Read the C source file(s) and produce a plain-English summary covering:
- The program's overall purpose
- All major functions: name, inputs, outputs, side effects
- Data structures (structs, enums, global state)
- External dependencies (files, sockets, system calls)
- Any non-obvious business rules or algorithms embedded in the code

Step 2 — Read the Spring Boot source files and produce:
- A component inventory: controllers, services, repositories, models, utilities
- The REST API surface (endpoints, methods, request/response shapes)
- How the Spring Boot design maps to the C functions identified above

Step 3 — Combine Steps 1 and 2 into a structured DESIGN.md with these sections:
1. Overview — what the application does, in two paragraphs
2. Architecture — a plain-text description of the layers (controller → service → repository)
3. C-to-Java migration map — a table with columns: C function | Java equivalent | Notes
4. Data model — key entities and their fields
5. API reference — each endpoint with method, path, request body, response body
6. Key business rules — logic that is not obvious from class/method names
7. Known gaps or assumptions made during migration

Format the output as Markdown. Do not summarise code line-by-line; 
focus on behaviour and intent.