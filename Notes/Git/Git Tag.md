## 1. Creating Tags

### Annotated Tags (Recommended)
Annotated tags are stored as full objects in the Git database. They contain the creator's name, email, date, and a tagging message. 

To create an annotated tag, use the `-a` flag and include a message with `-m`:
```bash
git tag -a v1.0.0 -m "Release version 1.0.0"
```

### Lightweight Tags
A lightweight tag is essentially just a pointer to a specific commit—very similar to a branch, but it doesn't move. It doesn't store extra information like who created it.

To create a lightweight tag, just omit the flags:
```bash
git tag v1.0.0-lw
```

---

## 2. Tagging Past Commits
If you forgot to tag a release yesterday and have made more commits since then, don't worry. You can tag a previous commit by specifying its **commit hash**.

1. First, look up your history to find the hash:
   ```bash
   git log --oneline
   ```
2. Tag that specific commit (replace `9fceb02` with your actual hash):
   ```bash
   git tag -a v0.9.0 9fceb02 -m "Oops, forgot to tag this yesterday"
   ```

---

## 3. Sharing Tags (Pushing to Remote)
By default, the `git push` command **does not** send your tags to remote servers (like GitHub or GitLab). You have to explicitly push them.

* **To push a single specific tag:**
  ```bash
  git push origin v1.0.0
  ```
* **To push all your local tags at once:**
  ```bash
  git push origin --tags
  ```

---

## 4. Managing and Deleting Tags

### Listing Tags
To see a list of all existing tags in your repository:
```bash
git tag
```
If you want to search for specific tags (e.g., all 1.x versions), you can use a wildcard pattern:
```bash
git tag -l "v1.*"
```

### Deleting Tags
If you made a mistake, you can easily delete a tag. 

* **Delete from your local repository:**
  ```bash
  git tag -d v1.0.0
  ```
* **Delete from the remote repository:**
  Deleting locally doesn't remove it from GitHub. You have to push the deletion:
  ```bash
  git push origin --delete v1.0.0
  ```
  