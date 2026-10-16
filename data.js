console.log('[DATA.JS] Loading Japanese character data...');

const japaneseData = {
    hiragana: {
        section1: [
            { char: 'あ', romaji: ['a'], readings: [] },
            { char: 'い', romaji: ['i'], readings: [] },
            { char: 'う', romaji: ['u'], readings: [] },
            { char: 'え', romaji: ['e'], readings: [] },
            { char: 'お', romaji: ['o'], readings: [] },
            { char: 'か', romaji: ['ka'], readings: [] },
            { char: 'き', romaji: ['ki'], readings: [] },
            { char: 'く', romaji: ['ku'], readings: [] },
            { char: 'け', romaji: ['ke'], readings: [] },
            { char: 'こ', romaji: ['ko'], readings: [] },
            { char: 'さ', romaji: ['sa'], readings: [] },
            { char: 'し', romaji: ['shi', 'si'], readings: [] },
            { char: 'す', romaji: ['su'], readings: [] },
            { char: 'せ', romaji: ['se'], readings: [] },
            { char: 'そ', romaji: ['so'], readings: [] }
        ],
        section2: [
            { char: 'た', romaji: ['ta'], readings: [] },
            { char: 'ち', romaji: ['chi', 'ti'], readings: [] },
            { char: 'つ', romaji: ['tsu', 'tu'], readings: [] },
            { char: 'て', romaji: ['te'], readings: [] },
            { char: 'と', romaji: ['to'], readings: [] },
            { char: 'な', romaji: ['na'], readings: [] },
            { char: 'に', romaji: ['ni'], readings: [] },
            { char: 'ぬ', romaji: ['nu'], readings: [] },
            { char: 'ね', romaji: ['ne'], readings: [] },
            { char: 'の', romaji: ['no'], readings: [] },
            { char: 'は', romaji: ['ha'], readings: [] },
            { char: 'ひ', romaji: ['hi'], readings: [] },
            { char: 'ふ', romaji: ['fu', 'hu'], readings: [] },
            { char: 'へ', romaji: ['he'], readings: [] },
            { char: 'ほ', romaji: ['ho'], readings: [] }
        ],
        section3: [
            { char: 'ま', romaji: ['ma'], readings: [] },
            { char: 'み', romaji: ['mi'], readings: [] },
            { char: 'む', romaji: ['mu'], readings: [] },
            { char: 'め', romaji: ['me'], readings: [] },
            { char: 'も', romaji: ['mo'], readings: [] },
            { char: 'や', romaji: ['ya'], readings: [] },
            { char: 'ゆ', romaji: ['yu'], readings: [] },
            { char: 'よ', romaji: ['yo'], readings: [] },
            { char: 'ら', romaji: ['ra'], readings: [] },
            { char: 'り', romaji: ['ri'], readings: [] },
            { char: 'る', romaji: ['ru'], readings: [] },
            { char: 'れ', romaji: ['re'], readings: [] },
            { char: 'ろ', romaji: ['ro'], readings: [] },
            { char: 'わ', romaji: ['wa'], readings: [] },
            { char: 'を', romaji: ['wo', 'o'], readings: [] },
            { char: 'ん', romaji: ['n', 'nn'], readings: [] }
        ]
    },

    katakana: {
        section1: [
            { char: 'ア', romaji: ['a'], readings: [] },
            { char: 'イ', romaji: ['i'], readings: [] },
            { char: 'ウ', romaji: ['u'], readings: [] },
            { char: 'エ', romaji: ['e'], readings: [] },
            { char: 'オ', romaji: ['o'], readings: [] },
            { char: 'カ', romaji: ['ka'], readings: [] },
            { char: 'キ', romaji: ['ki'], readings: [] },
            { char: 'ク', romaji: ['ku'], readings: [] },
            { char: 'ケ', romaji: ['ke'], readings: [] },
            { char: 'コ', romaji: ['ko'], readings: [] },
            { char: 'サ', romaji: ['sa'], readings: [] },
            { char: 'シ', romaji: ['shi', 'si'], readings: [] },
            { char: 'ス', romaji: ['su'], readings: [] },
            { char: 'セ', romaji: ['se'], readings: [] },
            { char: 'ソ', romaji: ['so'], readings: [] }
        ],
        section2: [
            { char: 'タ', romaji: ['ta'], readings: [] },
            { char: 'チ', romaji: ['chi', 'ti'], readings: [] },
            { char: 'ツ', romaji: ['tsu', 'tu'], readings: [] },
            { char: 'テ', romaji: ['te'], readings: [] },
            { char: 'ト', romaji: ['to'], readings: [] },
            { char: 'ナ', romaji: ['na'], readings: [] },
            { char: 'ニ', romaji: ['ni'], readings: [] },
            { char: 'ヌ', romaji: ['nu'], readings: [] },
            { char: 'ネ', romaji: ['ne'], readings: [] },
            { char: 'ノ', romaji: ['no'], readings: [] },
            { char: 'ハ', romaji: ['ha'], readings: [] },
            { char: 'ヒ', romaji: ['hi'], readings: [] },
            { char: 'フ', romaji: ['fu', 'hu'], readings: [] },
            { char: 'ヘ', romaji: ['he'], readings: [] },
            { char: 'ホ', romaji: ['ho'], readings: [] }
        ],
        section3: [
            { char: 'マ', romaji: ['ma'], readings: [] },
            { char: 'ミ', romaji: ['mi'], readings: [] },
            { char: 'ム', romaji: ['mu'], readings: [] },
            { char: 'メ', romaji: ['me'], readings: [] },
            { char: 'モ', romaji: ['mo'], readings: [] },
            { char: 'ヤ', romaji: ['ya'], readings: [] },
            { char: 'ユ', romaji: ['yu'], readings: [] },
            { char: 'ヨ', romaji: ['yo'], readings: [] },
            { char: 'ラ', romaji: ['ra'], readings: [] },
            { char: 'リ', romaji: ['ri'], readings: [] },
            { char: 'ル', romaji: ['ru'], readings: [] },
            { char: 'レ', romaji: ['re'], readings: [] },
            { char: 'ロ', romaji: ['ro'], readings: [] },
            { char: 'ワ', romaji: ['wa'], readings: [] },
            { char: 'ヲ', romaji: ['wo', 'o'], readings: [] },
            { char: 'ン', romaji: ['n', 'nn'], readings: [] }
        ]
    },

    kanji: {
        section1: [
            { char: '一', romaji: ['ichi', 'hitotsu'], readings: ['いち', 'ひとつ'] },
            { char: '二', romaji: ['ni', 'futatsu'], readings: ['に', 'ふたつ'] },
            { char: '三', romaji: ['san', 'mittsu'], readings: ['さん', 'みつ'] },
            { char: '四', romaji: ['shi', 'yon', 'yottsu'], readings: ['し', 'よん', 'よっつ'] },
            { char: '五', romaji: ['go', 'itsutsu'], readings: ['ご', 'いつつ'] },
            { char: '六', romaji: ['roku', 'muttsu'], readings: ['ろく', 'むっつ'] },
            { char: '七', romaji: ['nana', 'shichi', 'nanatsu'], readings: ['なな', 'しち', 'ななつ'] },
            { char: '八', romaji: ['hachi', 'yattsu'], readings: ['はち', 'やつ'] },
            { char: '九', romaji: ['kyuu', 'kyu', 'ku', 'kokonotsu'], readings: ['きゅう', 'く', 'ここのつ'] },
            { char: '十', romaji: ['juu', 'ju', 'too', 'to'], readings: ['じゅう', 'とお'] }
        ],
        section2: [
            { char: '百', romaji: ['hyaku'], readings: ['ひゃく'] },
            { char: '千', romaji: ['sen'], readings: ['せん'] },
            { char: '人', romaji: ['hito', 'nin', 'jin'], readings: ['ひと', 'にん'] },
            { char: '日', romaji: ['hi', 'ka', 'nichi'], readings: ['ひ', 'か', 'にち'] },
            { char: '月', romaji: ['tsuki', 'getsu', 'gatsu'], readings: ['つき', 'げつ', 'がつ'] },
            { char: '火', romaji: ['hi', 'ka'], readings: ['ひ', 'か'] },
            { char: '水', romaji: ['mizu', 'sui'], readings: ['みず', 'すい'] },
            { char: '木', romaji: ['ki', 'moku'], readings: ['き', 'もく'] },
            { char: '金', romaji: ['kane', 'kin'], readings: ['かね', 'きん'] },
            { char: '土', romaji: ['tsuchi', 'do'], readings: ['つち', 'ど'] }
        ],
        section3: [
            { char: '大', romaji: ['oo', 'dai', 'tai'], readings: ['おお', 'だい', 'たい'] },
            { char: '小', romaji: ['shou', 'sho', 'ko'], readings: ['しょう', 'こ'] },
            { char: '中', romaji: ['chuu', 'chu', 'naka'], readings: ['ちゅう', 'なか'] },
            { char: '上', romaji: ['ue', 'kami', 'jou', 'jo'], readings: ['うえ', 'かみ', 'じょう'] },
            { char: '下', romaji: ['shita', 'shimo', 'ge', 'ka'], readings: ['した', 'しも', 'げ', 'か'] },
            { char: '左', romaji: ['hidari'], readings: ['ひだり'] },
            { char: '右', romaji: ['migi', 'yuu', 'yu'], readings: ['みぎ', 'ゆう'] },
            { char: '本', romaji: ['hon', 'moto'], readings: ['ほん'] },
            { char: '国', romaji: ['kuni', 'koku'], readings: ['くに', 'こく'] },
            { char: '年', romaji: ['toshi', 'nen'], readings: ['とし', 'ねん'] },
            { char: '語', romaji: ['go', 'kata'], readings: ['ご'] },
            { char: '学', romaji: ['gaku', 'mana'], readings: ['がく', 'まな'] }
        ]
    }
};

console.log('[DATA.JS] Hiragana sections:', Object.keys(japaneseData.hiragana).length);
console.log('[DATA.JS] Section1 hiragana count:', japaneseData.hiragana.section1?.length || 0);
console.log('[DATA.JS] Data loaded successfully!');
