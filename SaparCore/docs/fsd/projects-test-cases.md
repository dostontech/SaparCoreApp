# Project Management & Workspaces Test Cases

**Module:** `projects`  
**FSD:** [`docs/fsd/projects.md`](./projects.md)  
**Standard:** Project Workspaces, Kanban Task Board (TODO $\to$ IN_PROGRESS $\to$ REVIEW $\to$ DONE), Task Assignments, Deadlines, and Billable Hours.

---

## 📋 Test Case Matrix

### Suite 01: Project Workspaces & Task Lifecycle
- `TC-PRJ-001`: Retrieve Project Workspace (`GET /projects/:projectId/workspace`) with Kanban stage breakdown.
- `TC-PRJ-002`: Create Project Task (`POST /projects/:projectId/tasks`) with priority, estimated hours, and assigned user.
- `TC-PRJ-003`: Progress Task stage (`PUT /projects/:projectId/tasks/:taskId/stage`) from `TODO` $\to$ `IN_PROGRESS` $\to$ `DONE`.
- `TC-PRJ-004`: Delete Project Task (`DELETE /projects/:projectId/tasks/:taskId`) and assert stage counts update.
