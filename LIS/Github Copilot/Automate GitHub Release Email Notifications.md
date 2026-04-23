## 1. Prepare GitHub Secrets

Even on internal servers, keeping credentials out of the code is best practice. Ensure these are set in your repository:

* `SMTP_SERVER`: `maildevsmtp.xxx.xxx`

* `SMTP_USERNAME`: [The service account username]

* `SMTP_PASSWORD`: [The service account password]

* `TEAM_MAILING_LIST`: [The destination email addresses]

  

## 2. Instructions for GitHub Copilot

Highlight your `publish` job in your `.github/workflows/your-file.yml` and provide this prompt:

  

> ****Copilot Prompt:****

> "I am using a ****Self-hosted runner**** and an internal SMTP server. Add a notification step after my library publish step. 

> 

> Use `dawidd6/action-send-mail@v3` with these specific details:

> - ****Server/Port:**** Use `secrets.SMTP_SERVER` on ****Port 25****.

> - ****Auth:**** Use `secrets.SMTP_USERNAME` and `secrets.SMTP_PASSWORD`.

> - ****Security:**** Set `secure: false` (standard for internal Port 25).

> - ****Condition:**** Only run if the previous step was successful (`if: success()`).

> - ****Content:**** Subject should be '🚀 Library Release: ${{ github.event.repository.name }}', and the body should list the version `${{ github.ref_name }}`, the actor, and a link to the release page."

  

---

  

## 3. The Final YAML Draft

Here is exactly what the step should look like in your workflow:

  

```yaml

      - name: Send Release Notification

        if: success()

        uses: dawidd6/action-send-mail@v3

        with:

          # Internal Network Details

          server_address: ${{ secrets.SMTP_SERVER }}

          server_port: 25

          # Credentials for the corporate relay

          username: ${{ secrets.SMTP_USERNAME }}

          password: ${{ secrets.SMTP_PASSWORD }}

          # Email Headers

          subject: "🚀 Library Published: ${{ github.event.repository.name }} v${{ github.ref_name }}"

          to: ${{ secrets.TEAM_MAILING_LIST }}

          from: GitHub CI <noreply@xxx.xxx>

          # Port 25 Logic: secure must be false

          secure: **false** 

          body: |

            Hi Team,

  

            A new version of the library has been successfully published by ${{ github.actor }}.

  

            - **Repository:** ${{ github.repository }}

            - **New Version:** ${{ github.ref_name }}

            - **Timestamp:** ${{ github.event.head_commit.timestamp }}

  

            View the full release notes and artifacts here:

            ${{ github.server_url }}/${{ github.repository }}/releases/tag/${{ github.ref_name }}

  

            ---

            *This is an automated notification from the self-hosted GitHub Runner.*

```

  

---

  

## 4. One Final Check for Your IT Team

Since the runner is internal, it should "just work," but if the workflow hangs or fails, double-check these two points:

1.  ****DNS Resolution:**** Ensure the self-hosted runner (the physical or virtual machine) can resolve the hostname `maildevsmtp.xxx.xxx`.

2.  ****Relay Permissions:**** Some internal SMTP servers require the IP of the self-hosted runner to be explicitly whitelisted to "Relay" mail, even if you provide a username and password.




```yaml
  Notify:
    name: Send Release Notification
    needs: [_Init_, PublishLib]
    runs-on: ${{ vars.RUNS_ON_2 }}
    if: ${{ success() }}
    steps:
      - name: Send Release Notification
        uses: dawidd6/action-send-mail@v3
        with:
          server_address: ${{ secrets.SMTP_SERVER }}
          server_port: 25
          username: ${{ secrets.SMTP_USERNAME }}
          password: ${{ secrets.SMTP_PASSWORD }}
          subject: "🚀 Library Published: ${{ github.event.repository.name }} v${{ github.ref_name }}"
          to: ${{ secrets.TEAM_MAILING_LIST }}
          from: GitHub CI <noreply@hagithub.home>
          secure: false
          body: |
            Hi Team,

            A new version of the library has been successfully published by ${{ github.actor }}.

            - **Repository:** ${{ github.repository }}
            - **New Version:** ${{ github.ref_name }}
            - **Timestamp:** ${{ github.event.head_commit.timestamp }}

            View the full release notes and artifacts here:
            ${{ github.server_url }}/${{ github.repository }}/releases/tag/${{ github.ref_name }}

            ---
            *This is an automated notification from the self-hosted GitHub Runner.*
```

# Slack Web hook
## Step 1: Create the Slack Webhook

1. Go to [api.slack.com/apps](https://api.slack.com/apps) and click **Create New App** (from scratch).

2. Name it "Library Release Bot" and select your workspace.

3. Go to **Incoming Webhooks** and toggle it to **On**.

4. Click **Add New Webhook to Workspace**, select the channel (e.g., `#dev-announcements`), and click **Authorize**.

5. **Copy the Webhook URL** (it looks like `https://hooks.slack.com/services/T.../B.../...`).

  

## Step 2: Add the GitHub Secret

Go to your GitHub Repository **Settings > Secrets and variables > Actions** and add:

* `SLACK_WEBHOOK_URL`: Paste the URL you just copied.

  

---

  

## Step 3: Prompt GitHub Copilot

Highlight your `publish` job and use this prompt:

  

> **Copilot Prompt:**

> "Add a Slack notification step after the library publish step.

> 1. Use the `rtCamp/action-slack-notify@v2` action.

> 2. Configuration:

> - Use `secrets.SLACK_WEBHOOK_URL`.

> - Set `SLACK_CHANNEL` to '#your-channel-name'.

> - Set `SLACK_TITLE` to '🚀 New Library Version Published'.

> - Set `SLACK_MESSAGE` to include the repo name and the version `${{ github.ref_name }}`.

> - Set `SLACK_COLOR` to 'good' (green).

> 3. Make sure this and the email step both run if the publish succeeds."

  

---

  

## Step 4: The Combined YAML (Email + Slack)

Here is how your workflow should look with both notifications integrated:

  

```yaml

# ... Previous steps (Checkout, Build, Publish) ...

  

- name: Send Slack Notification

if: success()

uses: rtCamp/action-slack-notify@v2

env:

SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK_URL }}

SLACK_CHANNEL: 'it-releases' # Or whatever your channel name is

SLACK_COLOR: 'good'

SLACK_TITLE: '🚀 Library Released: ${{ github.event.repository.name }}'

SLACK_MESSAGE: |

*Version:* ${{ github.ref_name }}

*Publisher:* ${{ github.actor }}

*Release Notes:* ${{ github.server_url }}/${{ github.repository }}/releases/tag/${{ github.ref_name }}

SLACK_ICON: https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png

  

- name: Send Email Notification

if: success()

uses: dawidd6/action-send-mail@v3

with:

server_address: ${{ secrets.SMTP_SERVER }}

server_port: 25

username: ${{ secrets.SMTP_USERNAME }}

password: ${{ secrets.SMTP_PASSWORD }}

subject: "📦 [Email] Library Published: ${{ github.event.repository.name }}"

to: ${{ secrets.TEAM_MAILING_LIST }}

from: GitHub Actions <noreply@yourcompany.com>

secure: false

body: |

The library has been successfully published.

Version: ${{ github.ref_name }}

Link: ${{ github.server_url }}/${{ github.repository }}/releases/tag/${{ github.ref_name }}

```

  

---

  

### Why this setup is effective:

* **Success Condition:** Both steps use `if: success()`, meaning they only trigger if the library actually reaches the registry.

* **Rich Formatting:** The Slack action automatically adds a nice colored bar (green for success) and can even include the GitHub user's avatar.

* **Redundancy:** Email serves as the "official record" for the IT team, while Slack provides the "instant alert" for the developers.

  

### A Note on "Self-Hosted" Security

Since your runner is self-hosted, it must have **outbound internet access** to reach `hooks.slack.com`. Usually, corporate networks allow this over Port 443 (HTTPS), but if it fails, you may need to ask your IT team to allow the runner's IP to talk to Slack's API endpoints.

## Web hook
```
https://hooks.slack.com/services/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
```

```yaml

```