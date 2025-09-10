// Execute cleanup directly using server credentials
const { exec } = require('child_process');
const fs = require('fs');

// Read the server.js file to extract GitHub credentials
const serverContent = fs.readFileSync('server.js', 'utf8');

// Extract GitHub credentials from server.js
const githubTokenMatch = serverContent.match(/const GITHUB_TOKEN = process\.env\.GITHUB_TOKEN;/);
const githubUsernameMatch = serverContent.match(/const GITHUB_USERNAME = process\.env\.GITHUB_USERNAME;/);

if (!githubTokenMatch || !githubUsernameMatch) {
  console.log('❌ Could not find GitHub credentials in server.js');
  process.exit(1);
}

// List of repositories to delete
const reposToDelete = [
  'todo-lista-5153324774-1757507609929',
  'calculateur-cnc-5153324774-1757420213594',
  'danxdz/calculateur-cnc-5153324774-1757420213594',
  'chat-5153324774-1757418652027',
  'danxdz/chat-5153324774-1757418652027',
  'blog-5153324774-1757376213509',
  'danxdz/blog-5153324774-1757376213509',
  'weather-dashboard-5153324774-1757421108186',
  'danxdz/weather-dashboard-5153324774-1757421108186',
  'blog-5153324774-1757423166207',
  'danxdz/blog-5153324774-1757423166207',
  'weather-dashboard-5153324774-1757425603124',
  'danxdz/weather-dashboard-5153324774-1757425603124',
  'todo-list-5153324774-1757432073507',
  'danxdz/todo-list-5153324774-1757432073507',
  'todo-list-5153324774-1757428764588',
  'danxdz/todo-list-5153324774-1757428764588',
  'blog-5153324774-1757416943167',
  'danxdz/blog-5153324774-1757416943167'
];

console.log('🧹 Starting repository cleanup...');
console.log(`📋 Found ${reposToDelete.length} repositories to delete`);

let deleted = 0;
let notFound = 0;
let failed = 0;

async function deleteRepository(repoName) {
  return new Promise((resolve) => {
    const fullRepoName = repoName.includes('/') ? repoName : `danxdz/${repoName}`;
    
    console.log(`🗑️ Deleting: ${fullRepoName}`);
    
    // Use curl to delete the repository
    const curlCommand = `curl -s -o /dev/null -w "%{http_code}" -X DELETE -H "Authorization: token $GITHUB_TOKEN" -H "Accept: application/vnd.github.v3+json" "https://api.github.com/repos/${fullRepoName}"`;
    
    exec(curlCommand, (error, stdout, stderr) => {
      const statusCode = stdout.trim();
      
      if (statusCode === '204') {
        console.log(`✅ Successfully deleted: ${fullRepoName}`);
        deleted++;
      } else if (statusCode === '404') {
        console.log(`⚠️ Repository not found: ${fullRepoName}`);
        notFound++;
      } else {
        console.log(`❌ Failed to delete ${fullRepoName}: HTTP ${statusCode}`);
        failed++;
      }
      
      resolve();
    });
  });
}

async function cleanupAll() {
  for (const repo of reposToDelete) {
    await deleteRepository(repo);
    // Wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 Cleanup Summary:');
  console.log(`✅ Successfully deleted: ${deleted}`);
  console.log(`⚠️ Not found: ${notFound}`);
  console.log(`❌ Failed: ${failed}`);
  console.log('\n🎉 Cleanup completed!');
}

cleanupAll().catch(console.error);