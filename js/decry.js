const form = document.getElementById('decryptForm');
const emailInput = document.getElementById('email');
const encryptedInput = document.getElementById('encryptedPassword');
const decryptedOutput = document.getElementById('decryptedPassword');
const copyBtn = document.getElementById('copyBtn');

function getExtensionScore(ext) {
  const commonExts = ['gmail.com', 'outlook.com'];
  return commonExts.includes(ext.toLowerCase()) ? 4 : 2;
}

function decryptEmailPart(encryptedStr) {
  // Extract Chc{num}tE{num} from the start of the encrypted string
  const regex = /^Chc(\d+)tE(\d+)/;
  const match = encryptedStr.match(regex);
  if (!match) return null;

  return {
    localCount: parseInt(match[1], 10),
    extScore: parseInt(match[2], 10),
    endIndex: match[0].length
  };
}

function numberToLetter(char) {
  if (char === '0') return 'o'; // zero special case
  const num = parseInt(char, 10);
  if (!isNaN(num) && num >= 1 && num <= 26) {
    return String.fromCharCode(num + 96);
  }
  return char;
}

function letterToNumber(char) {
  let lower = char.toLowerCase();
  if (lower === 'o') return '0';
  const code = lower.charCodeAt(0);
  if (code >= 97 && code <= 122) {
    return (code - 96).toString();
  }
  return char;
}

function decryptPassword(encPassword) {
  // Remove trailing IEA signature if exists
  if (!encPassword.endsWith('IEA')) return null;
  const core = encPassword.slice(0, -3);

  // Remove email encryption prefix (Chc12tE4t)
  const emailPart = decryptEmailPart(core);
  if (!emailPart) return null;

  // Extract password encrypted string part (after the email part and the 't' separator)
  const passwordPart = core.slice(emailPart.endIndex + 1);

  // Split by 't'
  const tokens = passwordPart.split('t');

  // Reverse the encryption logic:
  // Numbers (1-26) to letters a-z; 0 to 'o'
  // Letters a-i to digits 1-9; 'O' to 0
  // Special characters unchanged

  const decryptedArr = [];

  for (let token of tokens) {
    if (token === '') {
      decryptedArr.push(token);
      continue;
    }
    if (/^[1-9][0-9]*$/.test(token)) {
      // token is a number -> convert to letter
      // for example: 10, 11 etc, break into digits? But in encryption, only single digit numbers were added
      // To handle multi-digit numbers (like '10'), just convert to letter with ASCII

      const num = parseInt(token, 10);
      if (num === 0) {
        decryptedArr.push('o');
      } else if (num >= 1 && num <= 26) {
        decryptedArr.push(String.fromCharCode(num + 96));
      } else {
        // number out of range, keep as is (or error)
        decryptedArr.push(token);
      }
    } else if (/^[a-zA-Z]$/.test(token)) {
      // single letter, check if it's from digit mapping a-i -> 1-9 or O -> 0
      const lower = token.toLowerCase();

      if (lower === 'o') {
        decryptedArr.push('0');
      } else {
        // letters a-i map to digits 1-9
        const digitMap = {
          'a': '1',
          'b': '2',
          'c': '3',
          'd': '4',
          'e': '5',
          'f': '6',
          'g': '7',
          'h': '8',
          'i': '9',
          'o': '0',
          'O': '0'
        };

        if (digitMap[lower]) {
          decryptedArr.push(digitMap[lower]);
        } else {
          decryptedArr.push(token);
        }
      }
    } else {
      // Special char or others unchanged
      decryptedArr.push(token);
    }
  }

  // Now decryptedArr is reversed password, reverse back to original order
  decryptedArr.reverse();

  return decryptedArr.join('');
}

form.addEventListener('submit', e => {
  e.preventDefault();

  const email = emailInput.value.trim();
  const encrypted = encryptedInput.value.trim();

  if (!email || !encrypted) {
    alert('Please enter both email and encrypted password.');
    return;
  }

  // Validate signature
  if (!encrypted.endsWith('IEA')) {
    alert('Invalid encrypted password format: missing IEA signature.');
    return;
  }

  // Validate email part matches encrypted email counts

  const atIndex = email.indexOf('@');
  if (atIndex === -1 || atIndex === 0 || atIndex === email.length - 1) {
    alert('Please enter a valid email address.');
    return;
  }

  const localPartLen = atIndex;
  const domain = email.slice(atIndex + 1);
  const extScore = ['gmail.com', 'outlook.com'].includes(domain.toLowerCase()) ? 4 : 2;

  // Extract encrypted email counts from encrypted string for verification
  const emailRegex = /^Chc(\d+)tE(\d+)/;
  const match = encrypted.match(emailRegex);
  if (!match) {
    alert('Invalid encrypted password format: email part not found.');
    return;
  }

  const encLocalCount = parseInt(match[1], 10);
  const encExtScore = parseInt(match[2], 10);

  if (encLocalCount !== localPartLen || encExtScore !== extScore) {
    alert('Email address does not match encrypted password.');
    return;
  }

  // Decrypt password part
  const decrypted = decryptPassword(encrypted);

  if (!decrypted) {
    alert('Failed to decrypt the password. Please check your inputs.');
    return;
  }

  decryptedOutput.value = decrypted;
});

// Copy decrypted password
copyBtn.addEventListener('click', () => {
  if (!decryptedOutput.value) return;
  decryptedOutput.select();
  decryptedOutput.setSelectionRange(0, 99999); // Mobile support
  document.execCommand('copy');
  copyBtn.textContent = '✅ Copied!';
  setTimeout(() => {
    copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy Decrypted Password';
  }, 2000);
});
