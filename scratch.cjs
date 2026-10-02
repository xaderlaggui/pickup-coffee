const https = require('https');
https.get('https://pickup-coffee.com', (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    const cssLinks = [...data.matchAll(/href="([^"]+\.css[^"]*)"/g)].map(m => m[1]);
    cssLinks.forEach(link => {
      const url = link.startsWith('http') ? link : 'https://pickup-coffee.com' + (link.startsWith('/') ? link : '/' + link);
      https.get(url, (cRes) => {
        let cssData = '';
        cRes.on('data', d => cssData += d);
        cRes.on('end', () => {
          const hexRegex = /#([a-f0-9]{3}){1,2}\b/gi;
          const matches = cssData.match(hexRegex) || [];
          const counts = {};
          matches.forEach(m => { counts[m.toLowerCase()] = (counts[m.toLowerCase()] || 0) + 1 });
          console.log('CSS:', url);
          console.log(Object.entries(counts).sort((a,b) => b[1] - a[1]).slice(0, 10));
        });
      });
    });
  });
}).on('error', console.error);
