import { getUncachableGitHubClient } from './server/github';

async function checkRepository() {
  try {
    const octokit = await getUncachableGitHubClient();
    
    const { data } = await octokit.repos.getContent({
      owner: 'shielyule',
      repo: 'mystic-tarot',
      path: ''
    });
    
    console.log('✅ Files successfully transferred to GitHub:\n');
    
    if (Array.isArray(data)) {
      data.forEach(item => {
        const icon = item.type === 'dir' ? '📁' : '📄';
        console.log(`${icon} ${item.name}`);
      });
      
      console.log(`\n📊 Total items: ${data.length}`);
    }
    
    // Check for key files
    const fileNames = Array.isArray(data) ? data.map(item => item.name) : [];
    const keyFiles = ['README.md', 'package.json', 'client', 'server', 'shared'];
    const missingFiles = keyFiles.filter(f => !fileNames.includes(f));
    
    if (missingFiles.length === 0) {
      console.log('\n✅ All key project files are present!');
    } else {
      console.log(`\n⚠️  Missing files: ${missingFiles.join(', ')}`);
    }
    
  } catch (error: any) {
    console.error('❌ Error checking repository:', error.message);
  }
}

checkRepository();
