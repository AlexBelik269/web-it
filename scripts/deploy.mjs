// Uploads the built site (dist/) to the web server over FTPS.
// Only files that changed since the last upload are sent; pages you removed are deleted on the server.
//
// Usage:  npm run deploy            build + upload
//         npm run deploy:dry        show what would change, upload nothing
//
// Login details are read from the .env file in the project folder (never committed) — see .env.example.
import fs from 'node:fs';
import { deploy } from '@samkirkland/ftp-deploy';

if (fs.existsSync('.env')) process.loadEnvFile('.env');

const {
	FTP_HOST = 'ftpx.forpsi.com',
	FTP_USER,
	FTP_PASSWORD,
	FTP_PATH = '/www/it/',
	FTP_PROTOCOL = 'ftps',
	FTP_PORT = '21',
} = process.env;

const dryRun = process.argv.includes('--dry-run');

function fail(message) {
	console.error(`\n✖ ${message}\n`);
	process.exit(1);
}

if (!FTP_USER || !FTP_PASSWORD) {
	fail('FTP_USER and FTP_PASSWORD are missing. Copy .env.example to .env and fill them in.');
}
if (!FTP_PATH.endsWith('/') || ['/', './', '.'].includes(FTP_PATH)) {
	fail(`FTP_PATH must be the site folder and end with "/" (got "${FTP_PATH}").`);
}
if (!fs.existsSync('dist/index.html')) {
	fail('No built site in dist/. Run "npm run build" first (or use "npm run deploy", which builds for you).');
}

console.log(`${dryRun ? 'Dry run: ' : ''}uploading dist/ to ${FTP_USER}@${FTP_HOST}:${FTP_PATH} (${FTP_PROTOCOL})`);

try {
	await deploy({
		server: FTP_HOST,
		username: FTP_USER,
		password: FTP_PASSWORD,
		port: Number(FTP_PORT),
		protocol: FTP_PROTOCOL,
		'local-dir': './dist/',
		'server-dir': FTP_PATH,
		'dry-run': dryRun,
		'log-level': 'standard',
	});
	console.log(dryRun ? '\nDry run finished — nothing was uploaded.' : '\n✔ Site is live.');
} catch (error) {
	const msg = String(error?.message ?? error);
	if (msg.includes('530')) {
		fail('The server rejected the username or password (530). Check FTP_USER and FTP_PASSWORD in .env.');
	}
	fail(msg);
}
