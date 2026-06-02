const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

(async () => {
  const chrome = await chromeLauncher.launch({chromeFlags: ['--headless', '--no-sandbox']});
  const options = {logLevel: 'info', output: 'json', onlyCategories: ['performance','accessibility','best-practices','seo'], port: chrome.port};
  const runnerResult = await lighthouse('http://localhost:4000/api/health', options);

  const report = runnerResult.lhr;
  console.log('Lighthouse scores:');
  console.log('Performance:', report.categories.performance.score * 100);
  console.log('Accessibility:', report.categories.accessibility.score * 100);
  console.log('Best Practices:', report.categories['best-practices'].score * 100);
  console.log('SEO:', report.categories.seo.score * 100);

  await chrome.kill();
})();
