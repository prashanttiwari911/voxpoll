const fs = require('fs');
const path = 'c:/Users/witty/.gemini/antigravity/scratch/VoTI/src/app/polls/[id]/CommentsSection.tsx';
let content = fs.readFileSync(path, 'utf8');

// Remove dividers and block comments
content = content.replace(/\/\/ -{10,}\n/g, '');
content = content.replace(/\/\/ Types\n/g, '');
content = content.replace(/\/\/ Helpers\n/g, '');
content = content.replace(/\/\/ Single comment card.*\n/g, '');
content = content.replace(/\/\/ Main CommentsSection\n/g, '');
content = content.replace(/\{\/\* .*? \*\/\}\n?/g, '');
content = content.replace(/\/\*\*.*?\*\/\n/g, '');

// Refactor CommentCard state
const cardStateRegex = /const \[showReplyBox, setShowReplyBox\] = useState\(false\);\s*const \[showReplies, setShowReplies\] = useState\(true\);\s*const \[replyText, setReplyText\] = useState\(""\);\s*const \[replyError, setReplyError\] = useState<string \| null>\(null\);\s*const \[liked, setLiked\] = useState\(comment\.likedByMe \?\? false\);\s*const \[likeCount, setLikeCount\] = useState\(comment\.likes\);/;
const cardStateReplacement = `const [state, setState] = useState({ showReplyBox: false, showReplies: true, replyText: "", replyError: null as string | null, liked: comment.likedByMe ?? false, likeCount: comment.likes });`;
content = content.replace(cardStateRegex, cardStateReplacement);

content = content.replace(/setShowReplyBox\((.*?)\)/g, 'setState(s => ({ ...s, showReplyBox: typeof $1 === "function" ? $1(s.showReplyBox) : $1 }))');
content = content.replace(/setShowReplies\((.*?)\)/g, 'setState(s => ({ ...s, showReplies: typeof $1 === "function" ? $1(s.showReplies) : $1 }))');
content = content.replace(/setReplyText\((.*?)\)/g, 'setState(s => ({ ...s, replyText: $1 }))');
content = content.replace(/setReplyError\((.*?)\)/g, 'setState(s => ({ ...s, replyError: $1 }))');
content = content.replace(/setLiked\((.*?)\)/g, 'setState(s => ({ ...s, liked: $1 }))');
content = content.replace(/setLikeCount\((.*?)\)/g, 'setState(s => ({ ...s, likeCount: $1 }))');

content = content.replace(/\bshowReplyBox\b(?!:)/g, 'state.showReplyBox');
content = content.replace(/\bshowReplies\b(?!:)/g, 'state.showReplies');
content = content.replace(/\breplyText\b(?!:)/g, 'state.replyText');
content = content.replace(/\breplyError\b(?!:)/g, 'state.replyError');
content = content.replace(/\bliked\b(?!:)/g, 'state.liked');
content = content.replace(/\blikeCount\b(?!:)/g, 'state.likeCount');
content = content.replace(/state\.state\./g, 'state.');


// Refactor CommentsSection state
const secStateRegex = /const \[flatComments, setFlatComments\] = useState<CommentData\[\]>\(initialComments\);\s*const \[text, setText\] = useState\(""\);\s*const \[loading, setLoading\] = useState\(false\);\s*const \[error, setError\] = useState<string \| null>\(null\);/;
const secStateReplacement = `const [secState, setSecState] = useState({ flatComments: initialComments, text: "", loading: false, error: null as string | null });`;
content = content.replace(secStateRegex, secStateReplacement);

content = content.replace(/setFlatComments\((.*?)\)/g, 'setSecState(s => ({ ...s, flatComments: typeof $1 === "function" ? $1(s.flatComments) : $1 }))');
content = content.replace(/setText\((.*?)\)/g, 'setSecState(s => ({ ...s, text: $1 }))');
content = content.replace(/setLoading\((.*?)\)/g, 'setSecState(s => ({ ...s, loading: $1 }))');
content = content.replace(/setError\((.*?)\)/g, 'setSecState(s => ({ ...s, error: $1 }))');

// manual replaces for variables in CommentsSection body
content = content.replace(/flatComments/g, 'secState.flatComments');
content = content.replace(/\btext\b(?!:)/g, 'secState.text');
content = content.replace(/\bloading\b(?!:)/g, 'secState.loading');
content = content.replace(/\berror\b(?!:)/g, 'secState.error');
// fix any text properties in object literals
content = content.replace(/secState\.text: /g, 'text: ');
content = content.replace(/secState\.flatComments: /g, 'flatComments: ');

fs.writeFileSync(path, content);
