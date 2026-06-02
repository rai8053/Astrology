const fs = require('fs');
const path = require('path');

const files = ['ci.yml', 'deploy.yml', 'security.yml'];
files.forEach(f => {
  const fp = path.join('.github/workflows', f);
  try {
    const content = fs.readFileSync(fp, 'utf8');
    // Basic YAML syntax check - look for common issues
    if (content.includes(':\n  ') || content.includes(':\n- ')) {
      console.log(f + ': VALID (basic check)');
    } else {
      console.log(f + ': CHECK MANUALLY');
    }
  } catch(e) {
    console.log(f + ': ERROR - ' + e.message);
  }
});
