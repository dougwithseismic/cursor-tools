const { execSync } = require("child_process");
const readline = require("readline");
const fs = require("fs");
const path = require("path");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// ANSI escape codes for colors
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  blue: "\x1b[34m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
};

function log(message, color = colors.reset) {
  console.log(color + message + colors.reset);
}

function exec(command) {
  try {
    execSync(command, { stdio: "inherit" });
    return true;
  } catch (error) {
    return false;
  }
}

function getCurrentVersion() {
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
  return packageJson.version;
}

function updateChangelog(version, type) {
  const changelogPath = "CHANGELOG.md";
  const date = new Date().toLocaleDateString("en-GB").replace(/\//g, ".");
  const template = `## [${version}] - ${date}

### ${type.charAt(0).toUpperCase() + type.slice(1)}
- 

`;
  const content = fs.readFileSync(changelogPath, "utf8");
  fs.writeFileSync(changelogPath, template + content);
  log("Updated CHANGELOG.md", colors.green);
}

async function deleteTag(version) {
  log("\n🗑️  Deleting existing tag...", colors.blue);
  exec(`git tag -d v${version}`);
  exec(`git push origin :refs/tags/v${version}`);
}

async function release() {
  log("\n🚀 Starting release process...", colors.bright + colors.blue);

  // Check for uncommitted changes
  log("\n📋 Checking git status...", colors.blue);
  if (exec("git diff-index --quiet HEAD --")) {
    log("Working directory is clean", colors.green);
  } else {
    log(
      "❌ You have uncommitted changes. Please commit or stash them first.",
      colors.red
    );
    process.exit(1);
  }

  // Ask for version type
  const currentVersion = getCurrentVersion();
  log(`\nCurrent version: ${colors.bright}${currentVersion}${colors.reset}`);

  const question = `
Choose release type:
1) patch (${currentVersion.replace(/\d+$/, (match) => Number(match) + 1)})
2) minor (${currentVersion
    .split(".")
    .map((n, i) => (i === 1 ? Number(n) + 1 : i === 2 ? "0" : n))
    .join(".")})
3) major (${Number(currentVersion.split(".")[0]) + 1}.0.0)
4) replace (${currentVersion}) - Retry current version

Enter choice (1-4): `;

  rl.question(question, async (choice) => {
    let versionType;
    let isReplace = false;
    switch (choice) {
      case "1":
        versionType = "patch";
        break;
      case "2":
        versionType = "minor";
        break;
      case "3":
        versionType = "major";
        break;
      case "4":
        versionType = "replace";
        isReplace = true;
        break;
      default:
        log("❌ Invalid choice", colors.red);
        rl.close();
        process.exit(1);
    }

    if (isReplace) {
      // Delete existing tag
      await deleteTag(currentVersion);
    } else {
      log(`\n📦 Updating version (${versionType})...`, colors.blue);
      // Update CHANGELOG.md
      updateChangelog(currentVersion, versionType);

      // Open CHANGELOG.md for editing
      log(
        "\n✏️  Please update the CHANGELOG.md and press Enter when done...",
        colors.yellow
      );
      exec(
        process.platform === "win32"
          ? "notepad CHANGELOG.md"
          : "nano CHANGELOG.md"
      );
    }

    rl.question("\nProceed with release? (y/N) ", async (answer) => {
      if (answer.toLowerCase() !== "y") {
        log("❌ Release cancelled", colors.red);
        rl.close();
        process.exit(0);
      }

      if (!isReplace) {
        // Commit CHANGELOG.md changes
        log("\n📝 Committing CHANGELOG.md changes...", colors.blue);
        if (
          !exec("git add CHANGELOG.md") ||
          !exec('git commit -m "docs: update CHANGELOG.md"')
        ) {
          log("❌ Failed to commit CHANGELOG.md", colors.red);
          rl.close();
          process.exit(1);
        }

        // Run version update
        log("\n📝 Updating versions...", colors.blue);
        if (!exec(`pnpm version:${versionType}`)) {
          log("❌ Version update failed", colors.red);
          rl.close();
          process.exit(1);
        }
      }

      // Get version (same as current if replacing)
      const version = getCurrentVersion();

      // Push changes and tag
      log("\n🏷️  Pushing changes and tag...", colors.blue);
      const pushCmd = isReplace
        ? `git tag v${version} && git push origin v${version}`
        : `git push origin main && git push origin v${version}`;

      if (!exec(pushCmd)) {
        log("❌ Failed to push changes", colors.red);
        rl.close();
        process.exit(1);
      }

      log(`\n✅ Release v${version} completed!`, colors.bright + colors.green);
      log("\nGitHub Actions will now:");
      log("1. Build the app for all platforms");
      log("2. Create a GitHub release");
      log("3. Upload the installers");
      log("\nCheck the Actions tab on GitHub for progress.");

      rl.close();
    });
  });
}

release().catch((error) => {
  log(`\n❌ Error: ${error.message}`, colors.red);
  process.exit(1);
});
