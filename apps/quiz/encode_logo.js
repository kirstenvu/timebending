import fs from 'fs';
const logo = fs.readFileSync('public/assets/logo.png');
console.log('data:image/png;base64,' + logo.toString('base64'));
