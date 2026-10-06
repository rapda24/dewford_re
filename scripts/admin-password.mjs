// Prints a hash only. Enter the password through stdin; never pass it as an argument.
import { pbkdf2Sync, randomBytes } from 'node:crypto';
let password = '';
process.stderr.write('관리자 비밀번호를 입력하고 Enter를 누르세요: ');
if (process.stdin.isTTY) {
  process.stdin.setRawMode(true);
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => {
    for (const char of chunk) {
      if (char === '\u0003') process.exit(1);
      if (char === '\r' || char === '\n') { finish(); return; }
      if (char === '\u007f') password = password.slice(0, -1); else password += char;
    }
  });
} else {
  for await (const chunk of process.stdin) password += chunk;
  password = password.replace(/[\r\n]+$/, ''); finish();
}
function finish() {
  if (password.length < 12) { process.stderr.write('\n12자 이상으로 설정해 주세요.\n'); process.exit(1); }
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, salt, 100000, 32, 'sha256').toString('hex');
  process.stdout.write(`pbkdf2$100000$${salt}$${hash}\n`);
  if (process.stdin.isTTY) process.stdin.setRawMode(false);
  process.exit(0);
}
