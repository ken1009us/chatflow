/**
 * Comprehensive stopword lists for word cloud tokenization.
 * Sources: stopwords-iso, NLTK, spaCy, custom chat-specific additions.
 */

// Japanese: particles, auxiliary verbs, demonstratives, fillers, honorifics, common function words
const JA_STOP_WORDS = [
  // Particles (助詞)
  'は', 'が', 'を', 'に', 'で', 'へ', 'の', 'と', 'や', 'か', 'も',
  'な', 'よ', 'ね', 'さ', 'ぞ', 'ぜ', 'わ', 'け',
  'から', 'まで', 'より', 'ほど', 'くらい', 'ぐらい',
  'など', 'しか', 'だけ', 'ばかり', 'のみ', 'こそ',
  'って', 'けど', 'けれど', 'けれども', 'のに', 'ので',
  'ながら', 'たり', 'なり', 'やら', 'とか', 'だの',
  // Auxiliary verbs / endings (助動詞)
  'です', 'ます', 'ました', 'ません', 'でした', 'だった',
  'た', 'だ', 'ない', 'ぬ', 'ん',
  'れる', 'られる', 'せる', 'させる',
  'たい', 'たがる', 'そう', 'よう', 'らしい', 'べき', 'まい',
  // Copula / common verb forms
  'する', 'した', 'して', 'しない', 'しよう', 'すれ', 'しろ', 'せよ',
  'できる', 'できた', 'できない',
  'ある', 'あった', 'あり', 'あります', 'ありません',
  'いる', 'いた', 'いない', 'います', 'いません',
  'なる', 'なった', 'なり', 'なく', 'なっ', 'なくて',
  'くる', 'きた', 'きて', 'こない',
  'いく', 'いった', 'いって',
  'やる', 'やった', 'やって', 'やれ',
  'おる', 'おり', 'おります',
  'くれる', 'くれた', 'もらう', 'もらった', 'あげる', 'あげた',
  // Demonstratives (こそあど)
  'これ', 'それ', 'あれ', 'どれ',
  'この', 'その', 'あの', 'どの',
  'ここ', 'そこ', 'あそこ', 'どこ',
  'こう', 'そう', 'ああ', 'どう',
  'こんな', 'そんな', 'あんな', 'どんな',
  'こちら', 'そちら', 'あちら', 'どちら',
  'こっち', 'そっち', 'あっち', 'どっち',
  'こいつ', 'そいつ', 'あいつ', 'どいつ',
  'これら', 'それら', 'あれら',
  // Pronouns
  '私', 'わたし', '僕', 'ぼく', '俺', 'おれ',
  'あたし', 'うち', '自分', 'じぶん',
  'あなた', 'きみ', '君', 'お前', 'おまえ',
  '彼', '彼女', '我々', '私達', '私たち', '僕たち', '僕ら',
  '貴方', '貴方方',
  // Adverbs (common/filler)
  'もう', 'まだ', 'もっと', 'ちょっと', 'すこし', '少し',
  'とても', 'すごく', 'すごい', 'かなり', 'めっちゃ',
  'ぜんぜん', '全然', '結構', 'けっこう',
  'たぶん', '多分', 'きっと', 'ぜひ',
  'やっぱり', 'やっぱ', 'やはり',
  'ほんと', 'ほんとう', '本当', 'マジ', 'まじ',
  'なんか', 'なんとなく', 'いちおう', 'とりあえず',
  'ずっと', 'いつも', 'たまに', 'よく',
  'また', 'さらに', 'あと', 'まあ', 'まぁ',
  // Conjunctions
  'でも', 'だけど', 'しかし', 'それで', 'そして',
  'だから', 'なので', 'ところで', 'ちなみに',
  'それから', 'そもそも', 'つまり', 'および', 'かつて',
  'ただし', 'ため', 'として', 'とともに', 'と共に',
  // Sentence endings / chat expressions
  'よね', 'だよ', 'だね', 'かな', 'かも',
  'だろう', 'だろ', 'でしょう', 'でしょ',
  'じゃん', 'じゃない', 'じゃ', 'じゃなくて',
  'みたい', 'っぽい',
  // Honorifics / suffixes
  'ちゃん', 'くん', 'さん', 'さま', '先生',
  'たち', 'ども', 'がた',
  // Interjections / fillers
  'はい', 'うん', 'ええ', 'おう',
  'えっ', 'あっ', 'おっ', 'へー', 'ほー', 'おお',
  'わー', 'うわ', 'えー', 'うーん', 'あー',
  // Common short words (too generic for word cloud)
  'いい', 'よい', 'いう', 'こと', 'もの', 'ところ', 'とき',
  'ほか', 'ほとんど', 'ものの',
  'なに', 'なん', 'なんで', 'なぜ',
  'について', 'にて', 'によって', 'により', 'による',
  'において', 'における', 'に対して', 'に対する', 'に関する',
  'という', 'といった', 'それぞれ', 'その他', 'その後',
  'では', 'ただ', 'だっ', 'だれ',
  'でき', 'せ', 'ず',
  'つ', 'て', 'い', 'う', 'え', 'お',
  'く', 'き', 'し', 'ら', 'れ', 'り',
  // Common verbs too generic
  '思う', '思った', '思って', '言う', '言った',
  '知る', '知った', '見る', '見た', '見て',
  '出る', '出た', '行く', '行った', '行って', '行き',
  '来る', '来た', '来て',
]

// English: pronouns, prepositions, conjunctions, auxiliaries, determiners, adverbs
const EN_STOP_WORDS = [
  // Articles
  'a', 'an', 'the',
  // Pronouns
  'i', 'me', 'my', 'myself', 'mine',
  'we', 'us', 'our', 'ours', 'ourselves',
  'you', 'your', 'yours', 'yourself', 'yourselves',
  'he', 'him', 'his', 'himself',
  'she', 'her', 'hers', 'herself',
  'it', 'its', 'itself',
  'they', 'them', 'their', 'theirs', 'themselves',
  'what', 'which', 'who', 'whom', 'whose',
  // Prepositions
  'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between',
  'into', 'through', 'during', 'before', 'after', 'above', 'below',
  'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under',
  // Conjunctions
  'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while',
  'nor', 'so', 'yet', 'both', 'either', 'neither', 'whether',
  // Auxiliaries / Verbs
  'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'having',
  'do', 'does', 'did', 'doing', 'done',
  'can', 'could', 'will', 'would', 'shall', 'should',
  'may', 'might', 'must',
  // Determiners / Quantifiers
  'this', 'that', 'these', 'those',
  'all', 'any', 'each', 'every', 'few', 'more', 'most',
  'other', 'some', 'such', 'no', 'not', 'only', 'own', 'same',
  // Adverbs
  'again', 'further', 'then', 'once', 'here', 'there',
  'when', 'where', 'why', 'how', 'than', 'too', 'very',
  'just', 'now', 'also', 'still', 'even', 'already',
  'really', 'well', 'much', 'many', 'back',
  // Common verbs (too generic)
  'get', 'got', 'go', 'going', 'gone', 'went',
  'come', 'came', 'coming',
  'know', 'knew', 'known',
  'think', 'thought',
  'make', 'made', 'take', 'took', 'taken',
  'give', 'gave', 'given',
  'say', 'said', 'tell', 'told',
  'see', 'saw', 'seen',
  'want', 'need', 'like', 'look',
  'use', 'used', 'find', 'found',
  'put', 'keep', 'kept', 'let',
  // Common words
  'thing', 'things', 'way', 'time', 'lot',
  'always', 'never', 'often', 'sometimes',
  'something', 'anything', 'nothing', 'everything',
  'someone', 'anyone', 'everyone', 'nobody',
  // Contractions / fragments
  'don', 'doesn', 'didn', 'won', 'wouldn', 'couldn',
  'shouldn', 'isn', 'aren', 'wasn', 'weren', 'hasn', 'haven', 'hadn',
  'll', 've', 're',
  // URLs and noise
  'https', 'http', 'www', 'com', 'org', 'net',
  'emoji', 'sticker', 'gif', 'photo', 'image', 'video',
]

// Chinese: common function words (Traditional + Simplified)
const ZH_STOP_WORDS = [
  // Pronouns (繁體 + 簡體)
  '我', '你', '他', '她', '它', '們', '们',
  '我們', '我们', '你們', '你们', '他們', '他们', '她們', '她们',
  '自己', '大家', '別人', '别人', '人家', '咱', '咱們', '咱们',
  // Particles
  '的', '了', '是', '在', '不', '就', '也', '都', '而', '及',
  '與', '与', '或', '把', '被', '讓', '让', '給', '给',
  '向', '從', '从', '到', '對', '对', '所', '之', '以', '其', '過', '过',
  // Common function words (繁體 + 簡體)
  '就是', '不是', '沒有', '没有', '可以', '什麼', '什么',
  '這個', '这个', '那個', '那个', '一個', '一个',
  '還是', '还是', '知道', '覺得', '觉得', '應該', '应该',
  '怎麼', '怎么', '現在', '现在', '這樣', '这样', '真的',
  '不會', '不会', '可能', '所以', '比較', '比较',
  '也是', '也不', '是不',
  '很多', '一樣', '一样', '好像', '時候', '时候', '到底',
  '今天', '一下', '一些', '之前', '之後', '之后',
  '如果', '但是', '因為', '因为', '雖然', '虽然',
  '不過', '不过', '然後', '然后', '而且', '或者',
  '那麼', '那么', '這麼', '这么', '為什麼', '为什么',
  '怎麼樣', '怎么样', '什麼時候', '什么时候',
  '不知道', '不要', '不用', '不行', '不能', '不好',
  '確實', '确实', '其實', '其实', '當然', '当然',
  '感覺', '感觉', '後來', '后来', '已經', '已经',
  '出來', '出来', '起來', '起来', '看看', '一點', '一点',
  '還有', '还有', '這邊', '这边', '那邊', '那边',
  '這裡', '这里', '那裡', '那里',
  // Common verbs (too generic)
  '有', '沒', '没', '要', '會', '会', '能', '想', '看', '說', '说',
  '去', '來', '来', '做', '用', '吃', '喝', '買', '买', '賣', '卖',
  // Adverbs
  '很', '太', '好', '最', '更', '還', '还', '再', '又', '才', '剛', '刚',
  '一直', '常常', '總是', '总是', '從來', '从来',
  // Measure words / common
  '個', '个', '些', '點', '点', '次', '種', '种', '件',
  // Chat fillers / laughter
  '嗯', '喔', '啊', '哦', '唉', '哈', '呢', '吧', '嗎', '吗', '啦',
  '耶', '欸', '蛤', '齁', '哈哈', '哈哈哈', '哈哈哈哈',
  '呵呵', '嘻嘻', '嘿嘿', '噢',
]

export const STOP_WORDS: ReadonlySet<string> = new Set([
  ...JA_STOP_WORDS,
  ...EN_STOP_WORDS,
  ...ZH_STOP_WORDS,
])
