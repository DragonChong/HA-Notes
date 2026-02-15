# OpenShift React App Features

### Core Concept

A single-page ReactJS application that provides a streamlined, user-friendly interface for developers and SREs to monitor and manage specific OpenShift resources (Deployments, ConfigMaps, Secrets) without the complexity of the full admin console.

---

### Feature Brainstorm

#### **Phase 1: Minimum Viable Product (MVP) - The Essentials**

This is the core set of features to make the application useful.

**1. Authentication & Connection:**

- **Token-Based Login:** The user must provide their OpenShift API server URL and an authentication token (`oc whoami -t`).
- **Session Persistence:** Securely store the API URL and token in `sessionStorage` or `localStorage` for the duration of the session, so the user doesn't have to re-enter it on every page refresh.
- **Connection Status:** A clear indicator showing if the app is successfully connected to the OpenShift API.
- **Logout:** A button to clear the stored credentials and disconnect.

**2. Project / Namespace Selection:**

- **Namespace Lister:** On successful login, automatically fetch and display a list of all projects/namespaces the user has access to.
- **Global Namespace Selector:** A dropdown or a searchable list in the header/sidebar that allows the user to switch the context for the entire application. This is the most crucial UI element.

**3. Deployment Management (Read-Only Focus):**

- **Deployment List View:**
    - Display all deployments in the selected namespace.
    - Key columns: Deployment Name, Status (e.g., "Running", "Progressing", "Failed"), Replicas (Desired / Current / Ready), Last Deployed Time, and Container Images.
    - Health Indicators: Simple color-coded icons (green/yellow/red) to show the health of the deployment at a glance.
- **Deployment Detail View:**
    - Clicking a deployment takes you to a detailed page.
    - **Overview:** Shows labels, annotations, and strategy (RollingUpdate, etc.).
    - **Pod Listing:** Lists all pods managed by this deployment, with their status (Running, Pending, CrashLoopBackOff), restart count, and the node they are running on.
    - **Live Log Streaming:** The ability to select a pod and view a real-time stream of its logs. This is a killer feature.
    - **Events Table:** Display recent events related to the deployment and its ReplicaSets/Pods to easily debug issues.

**4. ConfigMap & Secret Management (Read-Only Focus):**

- **Resource List View:** Separate views for listing all ConfigMaps and all Secrets in the selected namespace.
- **Key columns:** Name, Number of Keys/Data Fields, Last Modified Time.
- **Detail View:**
    - View all key-value pairs within a selected ConfigMap.
    - For Secrets, display the keys but **hide the values by default**. A "Show Value" button (which decodes the base64 value) should be present for each key, perhaps with a warning.

---

#### **Phase 2: Core Functionality - Management & Interaction**

This phase adds the `create`, `update`, and `delete` capabilities the user requested.

**5. Deployment Actions:**

- **Scaling:** Simple buttons or an input field in the detail view to scale the number of replicas up or down.
- **Restart / Rollout:** A "Restart" button that triggers a new rollout of the deployment (`oc rollout latest`).
- **View/Edit YAML:** A modal or dedicated page that shows the full YAML of the deployment. An "Edit" mode could allow advanced users to make changes directly (this is an advanced feature).
- **Delete Deployment:** A delete button with a confirmation modal to prevent accidental deletion.

**6. ConfigMap & Secret CRUD Operations:**

- **Create New:** A form-based UI to create a new ConfigMap or Secret from scratch. The user would add key-value pairs dynamically.
- **Edit Existing:** In the detail view, allow users to:
    - Add new key-value pairs.
    - Edit the values of existing keys.
    - Delete individual key-value pairs.
- **Data Encoding/Decoding:** The UI should automatically handle base64 encoding/decoding for Secrets so the user can work with plain text.
- **Delete Resource:** A delete button with a confirmation modal for both ConfigMaps and Secrets.

---

#### **Phase 3: Quality of Life & Advanced Features**

These features make the application more powerful and enjoyable to use.

**7. Enhanced UI/UX:**

- **Global Search:** A powerful search bar in the header to quickly find any resource (Deployment, Pod, ConfigMap, etc.) by name within the current project.
- **Real-time Updates (WebSockets):** Instead of polling for changes, use the OpenShift API's `watch` endpoint to get real-time updates pushed to the UI. When a pod crashes or a deployment finishes, the UI updates instantly.
- **Notifications:** Use a toast/snackbar system to provide feedback for actions (e.g., "Deployment scaled successfully," "Error deleting ConfigMap").
- **Resource Usage Visualization:** On the dashboard/deployment view, show simple charts for CPU and Memory usage for the deployment's pods against their requests/limits.
- **Responsive Design:** Ensure the dashboard is usable on different screen sizes, including tablets.
- **Light/Dark Mode:** A toggle to switch between a light and dark theme.

**8. Advanced Management:**

- **RBAC Awareness:** The UI should intelligently disable actions the user doesn't have permission for. For example, if a user has `view` but not `edit` role, the "Edit" and "Delete" buttons should be disabled. This prevents user frustration.
- **Simple Route/Service Viewer:** A small section in the Deployment detail view that shows any associated Services or Routes, along with their URLs, so a developer can quickly access their application.
- **YAML Editor with Validation:** For the "Edit YAML" feature, use a library like Monaco Editor (from VS Code) with built-in YAML syntax highlighting and basic validation.

### Technical & Architectural Considerations

- **API Proxy:** Browsers will block direct API calls from your React app to the OpenShift API server due to CORS policy. You will need a simple backend proxy (e.g., a Node.js/Express server) that your React app talks to. This proxy will add the user's auth token to the `Authorization` header and forward the request to the real OpenShift API.
- **State Management:** For an application with this much shared state (current namespace, list of deployments, etc.), a robust state management library like **Redux Toolkit** or **Zustand** is highly recommended over just `useState`/`useContext`.
- **Component Library:** Don't build all your components from scratch. Use a mature component library like **Material-UI (MUI)**, **Ant Design**, or even **PatternFly** (Red Hat's own design system, which would make your app feel very native to the OpenShift environment).
- **API Client:** Use a library like `axios` to make HTTP requests. Create a centralized API service/wrapper in your code to handle requests, add auth headers, and manage base URLs.

---

Excellent idea! Integrating with GitHub transforms your dashboard from a simple resource manager into a true GitOps-aware observability tool. This connection provides crucial context, answering the question "What code is *actually* running in this environment?"

Here is a brainstorm of features to bridge your OpenShift dashboard with GitHub.

---

### Core Concept

Extend the dashboard to create a bidirectional view, linking OpenShift Deployments back to their source GitHub repositories. This allows users to see CI/CD status, commit details, and recent code changes directly alongside the operational status of their deployments.

---

### **Phase 1: Prerequisites & Setup (The Foundation)**

Before you can build the dashboard features, you need a way to link an OpenShift Deployment to a GitHub repository. The best practice for this is using **annotations** on your OpenShift resources.

1. **Establish an Annotation Convention:**
Your organization should adopt a standard set of annotations that your CI/CD process will apply to deployments.
    - `dashboard.my-app.io/github-repo`: The full repository name (e.g., `my-org/my-cool-app`). **(Essential)**
    - `dashboard.my-app.io/github-commit-sha`: The full Git commit SHA that was deployed. **(Essential)**
    - `dashboard.my-app.io/github-action-run-id`: The ID of the GitHub Action run that triggered the deployment. (Highly Recommended)
    - `dashboard.my-app.io/github-branch`: The branch the code was deployed from (e.g., `main`, `develop`).
1. **Instrument Your GitHub Actions Workflow:**
Modify your deployment workflow (`.github/workflows/deploy.yml`) to apply these annotations after a successful deployment.

**Example GitHub Actions Step:**

```yaml
- name: Annotate Deployment with Git Info
  if: success()
  run: |
    oc annotate deployment/my-app-deployment \
      dashboard.my-app.io/github-repo='${{ github.repository }}' \
      dashboard.my-app.io/github-commit-sha='${{ github.sha }}' \
      dashboard.my-app.io/github-action-run-id='${{ github.run_id }}' \
      --overwrite -n my-project
```

---

### **Phase 2: Core Dashboard Integration Features (The MVP)**

These are the essential features to display the GitHub context in your React app.

**1. GitHub API Configuration:**

- **Settings Page:** Add a settings or configuration section in your dashboard.
- **Personal Access Token (PAT):** The user needs to provide a GitHub PAT.
    - **Security:** Emphasize that a **read-only** token is sufficient and highly recommended (`repo` scope).
    - **Secure Storage:** Store this token securely in `sessionStorage` or `localStorage` for the session. For a more robust solution, the backend proxy should handle and store this token.

**2. Linking UI in the Dashboard:**

- **Automatic Discovery:** The dashboard should read the annotations of every Deployment it lists.
- **GitHub Icon/Link:** In the main **Deployment List View**, if a deployment has the `github-repo` annotation, display a small GitHub icon next to its name. Clicking this icon should open the repository in a new tab.

**3. The "GitHub Context" Panel:**

- In the **Deployment Detail View**, create a new panel or tab named "Source Control" or "GitHub Info".
- When this panel is loaded, it should:
    1. Read the `github-repo` and `github-commit-sha` annotations from the current deployment.
    2. Use the configured PAT to call the GitHub API.
    3. Display the following information:
        - **Repository:** `my-org/my-cool-app` (linked to the repo).
        - **Deployed Commit:** `a1b2c3d4...` (linked to the specific commit on GitHub).
        - **Commit Message:** The message from that commit (e.g., "feat: Add user login functionality").
        - **Author:** The name of the person who made the commit.
        - **Date:** When the commit was made.

**4. CI/CD Status Link:**

- If the `github-action-run-id` annotation is present, display a link:
    - **"View Deployment Log"** or **"View GitHub Action Run"**.
    - This link should point directly to the specific GitHub Action run summary page: `https://github.com/{org}/{repo}/actions/runs/{run_id}`.
    - This is a massive time-saver for debugging failed deployments.

---

### **Phase 3: Advanced & "Quality of Life" Features**

These features make the dashboard truly powerful for developers and SREs.

**1. "What's Changed?" View:**

- In the "GitHub Context" panel, fetch the latest commit from the deployment's primary branch (e.g., `main`).
- **Compare SHAs:** If the deployed SHA does not match the latest SHA on `main`, display a clear message like: **"This deployment is 5 commits behind `main`."**
- **Changelog:** Use the GitHub API's "compare commits" endpoint to fetch and display the list of commits that have been made since the current version was deployed. This provides an instant "pending changes" view.

**2. Pull Request & Release Information:**

- **PR Context:** Use the GitHub API to find the Pull Request associated with the deployed commit. Display the PR title and number, and link to it. (e.g., "Deployed via PR #123: Refactor Authentication Service").
- **Release Tags:** If you use GitHub Releases, check if the deployed commit SHA is associated with a Git tag. If so, display the tag name (e.g., `v1.2.3`).

**3. Deeper Search & Filtering:**

- **Filter by Repository:** Add a filter to the main dashboard to only show deployments originating from a specific GitHub repository.
- **Search by Commit SHA:** Allow users to paste a commit SHA into the main search bar to quickly find which deployment (and in which environment/namespace) is running that specific code.

**4. Trigger Actions (The "Write" Operations):**

- **"Deploy Latest" Button:**
    - Add a button in the UI that, when clicked, triggers a new GitHub Action workflow to deploy the latest commit from the `main` branch.
    - This uses GitHub's `workflow_dispatch` event.
    - **Requires careful RBAC:** This is a powerful action and should only be available to authorized users.
- **"Rollback" Functionality:**
    - Display a history of recent successful deployments (perhaps by querying the GitHub Action runs).
    - Allow a user to select a previous successful run and trigger a "re-run" of that job, effectively rolling back to a previous commit.

---

### **Architecture & Technical Considerations**

- **Backend Proxy Enhancement:** Your backend proxy is now even more critical. It should be responsible for:
    1. Proxying requests to the OpenShift API.
    2. Proxying requests to the GitHub API. This is the **most secure way** to handle the GitHub PAT, as the token never needs to be sent to the browser. The browser makes a request to *your* backend, which then adds the secret PAT and forwards the request to GitHub.
- **API Client:** Use a robust library like **Octokit.js** to simplify interactions with the GitHub REST API.
- **Performance:** Be mindful of GitHub API rate limits. Cache responses for short periods (e.g., 1-2 minutes) for things that don't change often, like commit details, to ensure a snappy UI and stay within your rate limit.