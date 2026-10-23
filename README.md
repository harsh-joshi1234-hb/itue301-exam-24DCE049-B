# Campus Canteen Pre-Order - Starter Kit (ITUE301 Practical Exam, Set C)

Inherited code: each module should meet the rules in the exam paper, but does not. Find out why and fix it.

## Run
Frontend:  cd frontend && npm install && npm run dev      -> http://localhost:5173
Backend:   cd backend  && npm install && npm start        -> http://localhost:5000
Self-check (backend): cd backend && npm test      (passing tests != full marks)
Database:  copy .env.example to .env, set MONGO_URI (Atlas or local), then: npm run seed

## Rules
- Never commit .env. Keep node_modules out of git.
- Keep FINDINGS.md updated; commit at least once per task, message starting with T1..T5.
