// Using built-in fetch (Node.js 18+)

// GitHub credentials
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USERNAME = process.env.GITHUB_USERNAME;

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

async function deleteRepository(repoName) {
  try {
    // Handle both formats: "repo-name" and "username/repo-name"
    const fullRepoName = repoName.includes('/') ? repoName : `${GITHUB_USERNAME}/${repoName}`;
    
    console.log(`🗑️ Deleting repository: ${fullRepoName}`);
    
    const response = await fetch(`https://api.github.com/repos/${fullRepoName}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Repository-Cleanup-Script'
      }
    });

    if (response.ok) {
      console.log(`✅ Successfully deleted: ${fullRepoName}`);
      return { success: true, repo: fullRepoName };
    } else if (response.status === 404) {
      console.log(`⚠️ Repository not found: ${fullRepoName}`);
      return { success: false, repo: fullRepoName, error: 'Not found' };
    } else {
      const errorText = await response.text();
      console.log(`❌ Failed to delete ${fullRepoName}: ${response.status} - ${errorText}`);
      return { success: false, repo: fullRepoName, error: `${response.status}: ${errorText}` };
    }
  } catch (error) {
    console.error(`❌ Error deleting ${repoName}:`, error.message);
    return { success: false, repo: repoName, error: error.message };
  }
}

async function cleanupRepositories() {
  if (!GITHUB_TOKEN || !GITHUB_USERNAME) {
    console.error('❌ Missing GitHub credentials!');
    console.error('Please set GITHUB_TOKEN and GITHUB_USERNAME environment variables');
    process.exit(1);
  }

  console.log(`🧹 Starting cleanup of ${reposToDelete.length} repositories...`);
  console.log(`👤 GitHub User: ${GITHUB_USERNAME}`);
  console.log('');

  const results = {
    deleted: [],
    notFound: [],
    failed: []
  };

  for (const repoName of reposToDelete) {
    const result = await deleteRepository(repoName);
    
    if (result.success) {
      results.deleted.push(result.repo);
    } else if (result.error === 'Not found') {
      results.notFound.push(result.repo);
    } else {
      results.failed.push({ repo: result.repo, error: result.error });
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n📊 Cleanup Summary:');
  console.log(`✅ Successfully deleted: ${results.deleted.length}`);
  console.log(`⚠️ Not found: ${results.notFound.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);

  if (results.deleted.length > 0) {
    console.log('\n🗑️ Deleted repositories:');
    results.deleted.forEach(repo => console.log(`  • ${repo}`));
  }

  if (results.notFound.length > 0) {
    console.log('\n⚠️ Not found repositories:');
    results.notFound.forEach(repo => console.log(`  • ${repo}`));
  }

  if (results.failed.length > 0) {
    console.log('\n❌ Failed to delete:');
    results.failed.forEach(({ repo, error }) => console.log(`  • ${repo}: ${error}`));
  }

  console.log('\n🎉 Cleanup completed!');
}

// Run the cleanup
cleanupRepositories().catch(error => {
  console.error('💥 Cleanup failed:', error);
  process.exit(1);
});