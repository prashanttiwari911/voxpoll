const fs = require('fs');
const path = 'c:/Users/witty/.gemini/antigravity/scratch/VoTI/src/app/polls/[id]/SharePollModal.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /const \[isOpen, setIsOpen\] = useState\(false\);\s*const \[activeTab, setActiveTab\] = useState<"link" \| "email">\("link"\);\s*const \[emailAddresses, setEmailAddresses\] = useState\(""\);\s*const \[emailMessage, setEmailMessage\] = useState\(""\);\s*const \[isSending, setIsSending\] = useState\(false\);\s*const \[copied, setCopied\] = useState\(false\);/;
const replacement = `const [state, setState] = useState({ isOpen: false, activeTab: "link" as "link" | "email", emailAddresses: "", emailMessage: "", isSending: false, copied: false });`;

content = content.replace(regex, replacement);

content = content.replace(/setIsOpen\((.*?)\)/g, 'setState(s => ({ ...s, isOpen: $1 }))');
content = content.replace(/setActiveTab\((.*?)\)/g, 'setState(s => ({ ...s, activeTab: $1 }))');
content = content.replace(/setEmailAddresses\((.*?)\)/g, 'setState(s => ({ ...s, emailAddresses: $1 }))');
content = content.replace(/setEmailMessage\((.*?)\)/g, 'setState(s => ({ ...s, emailMessage: $1 }))');
content = content.replace(/setIsSending\((.*?)\)/g, 'setState(s => ({ ...s, isSending: $1 }))');
content = content.replace(/setCopied\((.*?)\)/g, 'setState(s => ({ ...s, copied: $1 }))');

content = content.replace(/\bisOpen\b(?!:)/g, 'state.isOpen');
content = content.replace(/\bactiveTab\b(?!:)/g, 'state.activeTab');
content = content.replace(/\bemailAddresses\b(?!:)/g, 'state.emailAddresses');
content = content.replace(/\bemailMessage\b(?!:)/g, 'state.emailMessage');
content = content.replace(/\bisSending\b(?!:)/g, 'state.isSending');
content = content.replace(/\bcopied\b(?!:)/g, 'state.copied');

content = content.replace(/state\.state\./g, 'state.');
content = content.replace(/\{\/\* .*? \*\/\}\n?/g, '');

fs.writeFileSync(path, content);
