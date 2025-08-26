#!/usr/bin/env node

/**
 * Setup script for release automation
 * This script helps configure the release process for the first time
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const questions = [
  {
    key: 'githubRepo',
    question: 'What is your GitHub repository URL? (e.g., https://github.com/username/repo): ',
    default: 'https://github.com/your-username/discover-sports-hk',
  },
  {
    key: 'appleId',
    question: 'What is your Apple ID email for App Store submissions? (optional): ',
    default: 'your-apple-id@example.com',
  },
  {
    key: 'ascAppId',
    question: 'What is your App Store Connect App ID? (optional): ',
    default: 'your-app-store-connect-app-id',
  },
  {
    key: 'appleTeamId',
    question: 'What is your Apple Team ID? (optional): ',
    default: 'your-team-id',
  },
];

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question.question, (answer) => {
      resolve(answer.trim() || question.default);
    });
  });
}

function updateVersionRc(githubRepo) {
  const versionRcPath = path.join(process.cwd(), '.versionrc.json');
  const config = JSON.parse(fs.readFileSync(versionRcPath, 'utf8'));

  const repoUrl = githubRepo.replace('.git', '');
  config.commitUrlFormat = `${repoUrl}/commit/{{hash}}`;
  config.compareUrlFormat = `${repoUrl}/compare/{{previousTag}}...{{currentTag}}`;
  config.issueUrlFormat = `${repoUrl}/issues/{{id}}`;

  fs.writeFileSync(versionRcPath, JSON.stringify(config, null, 2));
  process.stdout.write('✅ Updated .versionrc.json with your repository URLs\n');
}

function updateEasJson(appleId, ascAppId, appleTeamId) {
  const easJsonPath = path.join(process.cwd(), 'eas.json');
  const config = JSON.parse(fs.readFileSync(easJsonPath, 'utf8'));

  if (appleId !== 'your-apple-id@example.com') {
    config.submit.production.ios.appleId = appleId;
  }
  if (ascAppId !== 'your-app-store-connect-app-id') {
    config.submit.production.ios.ascAppId = ascAppId;
  }
  if (appleTeamId !== 'your-team-id') {
    config.submit.production.ios.appleTeamId = appleTeamId;
  }

  fs.writeFileSync(easJsonPath, JSON.stringify(config, null, 2));
  process.stdout.write('✅ Updated eas.json with your Apple credentials\n');
}

async function main() {
  process.stdout.write('🚀 Setting up release automation for Discover Sports HK\n\n');

  const answers = {};

  for (const question of questions) {
    answers[question.key] = await askQuestion(question);
  }

  process.stdout.write('\n📝 Updating configuration files...\n\n');

  updateVersionRc(answers.githubRepo);
  updateEasJson(answers.appleId, answers.ascAppId, answers.appleTeamId);

  process.stdout.write('\n✅ Setup complete! Next steps:\n\n');
  process.stdout.write('1. Set up GitHub repository secrets:\n');
  process.stdout.write('   - EXPO_TOKEN: Your Expo access token\n');
  process.stdout.write('   - Add any additional secrets for store submission\n\n');
  process.stdout.write('2. Test the release process:\n');
  process.stdout.write('   - bun run release:dry (preview changes)\n');
  process.stdout.write('   - bun run release:alpha (create alpha release)\n\n');
  process.stdout.write('3. Read the full documentation:\n');
  process.stdout.write('   - docs/RELEASE_PROCESS.md\n\n');
  process.stdout.write('🎉 Happy releasing!\n');

  rl.close();
}

main().catch((e) => process.stderr.write(`${e?.stack || e}\n`));
