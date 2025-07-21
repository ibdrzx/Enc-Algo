// Encryption algorithm with special character handling and fixed letter/number swap

const form = document.getElementById('encryptForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const encryptedOutput = document.getElementById('encryptedPassword');
const copyBtn = document.getElementById('copyBtn');

function getExtensionScore(ext) {
  const commonExts = ['gmail.com', 'outlook.com'];
  return commonExts.includes(ext.toLowerCase()) ? 4 : 2;
}

function encryptEmail(email) {
  // Split email into local and domain parts
  const atIndex = email.indexOf('@');
  if (atIndex === -1) return null;

  const localPart = email.slice(0, atIndex);
  const domainPart = email.slice(atIndex + 1);

  const localCount = localPart.length;
  const extScore = getExtensionScore(domainPart);

  return `Chc${localCount}tE${extScore}`;
}

function letterToNumber(char) {
  // a=1..z=26, 'o'->0 special case
  let lower = char.toLowerCase();
  if (lower === 'o') return '0';
  const code = lower.charCodeAt(0);
  if (code >= 97 && code <= 122) {
    return (code - 96).toString();
  }
  return char;
}

function numberToLetter(char) {
  // 0 -> o special case
  if (char === '0') return 'o';
  const num = parseInt(char, 10);
  if (!isNaN(num) && num >= 1 && num <= 26) {
    return String.fromCharCode(num + 96);
  }
  return char;
}

function encryptPassword(password) {
  // Reverse password
  const reversed = password.split('').reverse();

  const resultTokens = reversed.map(char => {
    if (/[a-zA-Z]/.test(char)) {
      return letterToNumber(char);
    } else if (/[0-9]/.test(char)) {
      // Number to letter map, 0->O
      if (char === '0') return 'O';

      // Map digit to letter a=1,... i=9 (like encryption example)
      const digitMap = {
        '1': 'a',
        '2': 'b',
        '3': 'c',
        '4': 'd',
        '5': 'e',
        '6': 'f',
        '7': 'g',
        '8': 'h',
        '9': 'i'
      };
      return digitMap[char] || char;
    } else {
      // Special chars remain unchanged
      return char;
    }
  });

  return resultTokens.join('t');
}

function encrypt(email, password) {
  const emailEnc = encryptEmail(email);
  const passwordEnc = encryptPassword(password);
  if (!emailEnc || !passwordEnc) return null;
  return `${emailEnc}t${passwordEnc}IEA`;
}

// Event listeners

form.addEventListener('submit', e => {
  e.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    alert('Please enter both email and password.');
    return;
  }

  // Simple email validation
  if (!email.includes('@') || email.startsWith('@') || email.endsWith('@')) {
    alert('Please enter a valid email address.');
    return;
  }

  const encrypted = encrypt(email, password);
  if (encrypted) {
    encryptedOutput.value = encrypted;
  } else {
    encryptedOutput.value = '';
  }
});

// Copy encrypted password
copyBtn.addEventListener('click', () => {
  if (!encryptedOutput.value) return;
  encryptedOutput.select();
  encryptedOutput.setSelectionRange(0, 99999); // For mobile devices
  document.execCommand('copy');
  copyBtn.textContent = '✅ Copied!';
  setTimeout(() => {
    copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy Encrypted Password';
  }, 2000);
});
