const fs = require('fs');
const path = 'c:/Users/witty/.gemini/antigravity/scratch/VoTI/src/app/polls/[id]/CommentsSection.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/secState\.text-/g, 'text-');
content = content.replace(/secState\.text: /g, 'text: ');
content = content.replace(/comment\.secState\.text/g, 'comment.text');
content = content.replace(/res\.secState\.error/g, 'res.error');
content = content.replace(/result\.secState\.error/g, 'result.error');

content = content.replace(/setState\(s => \(\{ \.\.\.s, showReplyBox: typeof false === "function" \? false\(s\.state\.showReplyBox\) : false \}\)\);/g,
  'setState(s => ({ ...s, showReplyBox: false }));');

content = content.replace(/setState\(s => \(\{ \.\.\.s, showReplies: typeof true === "function" \? true\(s\.state\.showReplies\) : true \}\)\);/g,
  'setState(s => ({ ...s, showReplies: true }));');

content = content.replace(/onClick=\{\(\) => setState\(s => \(\{ \.\.\.s, showReplyBox: typeof \(v === "function" \? \(v\(s\.state\.showReplyBox\) : \(v \}\)\) => !v\}/g,
  'onClick={() => setState(s => ({ ...s, showReplyBox: !s.showReplyBox }))}');

content = content.replace(/onClick=\{\(\) => setState\(s => \(\{ \.\.\.s, showReplies: typeof \(v === "function" \? \(v\(s\.state\.showReplies\) : \(v \}\)\) => !v\}/g,
  'onClick={() => setState(s => ({ ...s, showReplies: !s.showReplies }))}');

content = content.replace(/setSecState\(s => \(\{ \.\.\.s, flatComments: typeof \(prev === "function" \? \(prev\(s\.secState\.flatComments\) : \(prev \}\)\) => \[newComment, \.\.\.prev\]\);/g,
  'setSecState(s => ({ ...s, flatComments: [newComment, ...s.flatComments] }));');

content = content.replace(/text: state\.replyText,/g, 'text: replyText,');

content = content.replace(/setSecState\(s => \(\{ \.\.\.s, flatComments: typeof \(prev === "function" \? \(prev\(s\.secState\.flatComments\) : \(prev \}\)\) => \[\.\.\.prev, newReply\]\);/g,
  'setSecState(s => ({ ...s, flatComments: [...s.flatComments, newReply] }));');

content = content.replace(/setSecState\(s => \(\{ \.\.\.s, flatComments: typeof \(prev === "function" \? \(prev\(s\.secState\.flatComments\) : \(prev \}\)\) => prev\.filter\(\(c\) => c\.id !== id && c\.parentId !== id\)\);/g,
  'setSecState(s => ({ ...s, flatComments: s.flatComments.filter((c) => c.id !== id && c.parentId !== id) }));');

content = content.replace(/setSecState\(s => \(\{ \.\.\.s, flatComments: typeof \(prev === "function" \? \(prev\(s\.secState\.flatComments\) : \(prev \}\)\) =>\s*prev\.map\(\(c\) => \(c\.id === id \? \{ \.\.\.c, likes, likedByMe: state\.liked \} : c\)\)\s*\);/g,
  'setSecState(s => ({ ...s, flatComments: s.flatComments.map((c) => (c.id === id ? { ...c, likes, likedByMe: liked } : c)) }));');

fs.writeFileSync(path, content);
