// Simple script to delete repositories
// Run with: node delete-repos.js

// You need to replace these with your actual values
const GITHUB_TOKEN = 'YOUR_GITHUB_TOKEN_HERE';
const GITHUB_USERNAME = 'danxdz';

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

async function deleteRepo(repoName) {
  const fullRepoName = repoName.includes('/') ? repoName : `${GITHUB_USERNAME}/${repoName}`;
  
  try {
    const response = await fetch(`https://api.github.com/repos/${fullRepoName}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Repo-Cleanup'
      }
    });

    if (response.ok) {
      console.log(`✅ Deleted: ${fullRepoName}`);
      return true;
    } else if (response.status === 404) {
      console.log(`⚠️ Not found: ${fullRepoName}`);
      return false;
    } else {
      const error = await response.text();
      console.log(`❌ Failed: ${fullRepoName} - ${response.status}: ${error}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error: ${fullRepoName} - ${error.message}`);
    return false;
  }
}

async function main() {
  if (GITHUB_TOKEN === 'YOUR_GITHUB_TOKEN_HERE') {
    console.log('❌ Please replace YOUR_GITHUB_TOKEN_HERE with your actual GitHub token');
    console.log('Edit this file and replace the token, then run: node delete-repos.js');
    return;
  }

  console.log(`🧹 Deleting ${reposToDelete.length} repositories...`);
  
  let deleted = 0;
  let notFound = 0;
  let failed = 0;

  for (const repo of reposToDelete) {
    const success = await deleteRepo(repo);
    if (success) {
      deleted++;
    } else {
      notFound++;
    }
    
    // Wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\n📊 Summary:`);
  console.log(`✅ Deleted: ${deleted}`);
  console.log(`⚠️ Not found: ${notFound}`);
  console.log(`❌ Failed: ${failed}`);
}

main().catch(console.error);