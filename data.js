/* Japanese character data.
   Each entry: { char, romaji: [accepted romaji spellings], readings: [kana readings, kanji only] }
   Every section key MUST be section1 / section2 / section3 to match the HTML buttons. */

const japaneseData = {

    hiragana: {
        section1: [
            { char: 'あ', romaji: ['a'] },
            { char: 'い', romaji: ['i'] },
            { char: 'う', romaji: ['u'] },
            { char: 'え', romaji: ['e'] },
            { char: 'お', romaji: ['o'] },
            { char: 'か', romaji: ['ka'] },
            { char: 'き', romaji: ['ki'] },
            { char: 'く', romaji: ['ku'] },
            { char: 'け', romaji: ['ke'] },
            { char: 'こ', romaji: ['ko'] },
            { char: 'さ', romaji: ['sa'] },
            { char: 'し', romaji: ['shi', 'si'] },
            { char: 'す', romaji: ['su'] },
            { char: 'せ', romaji: ['se'] },
            { char: 'そ', romaji: ['so'] }
        ],
        section2: [
            { char: 'た', romaji: ['ta'] },
            { char: 'ち', romaji: ['chi', 'ti'] },
            { char: 'つ', romaji: ['tsu', 'tu'] },
            { char: 'て', romaji: ['te'] },
            { char: 'と', romaji: ['to'] },
            { char: 'な', romaji: ['na'] },
            { char: 'に', romaji: ['ni'] },
            { char: 'ぬ', romaji: ['nu'] },
            { char: 'ね', romaji: ['ne'] },
            { char: 'の', romaji: ['no'] },
            { char: 'は', romaji: ['ha'] },
            { char: 'ひ', romaji: ['hi'] },
            { char: 'ふ', romaji: ['fu', 'hu'] },
            { char: 'へ', romaji: ['he'] },
            { char: 'ほ', romaji: ['ho'] }
        ],
        section3: [
            { char: 'ま', romaji: ['ma'] },
            { char: 'み', romaji: ['mi'] },
            { char: 'む', romaji: ['mu'] },
            { char: 'め', romaji: ['me'] },
            { char: 'も', romaji: ['mo'] },
            { char: 'や', romaji: ['ya'] },
            { char: 'ゆ', romaji: ['yu'] },
            { char: 'よ', romaji: ['yo'] },
            { char: 'ら', romaji: ['ra'] },
            { char: 'り', romaji: ['ri'] },
            { char: 'る', romaji: ['ru'] },
            { char: 'れ', romaji: ['re'] },
            { char: 'ろ', romaji: ['ro'] },
            { char: 'わ', romaji: ['wa'] },
            { char: 'を', romaji: ['wo', 'o'] },
            { char: 'ん', romaji: ['n', 'nn'] }
        ]
    },

    katakana: {
        section1: [
            { char: 'ア', romaji: ['a'] },
            { char: 'イ', romaji: ['i'] },
            { char: 'ウ', romaji: ['u'] },
            { char: 'エ', romaji: ['e'] },
            { char: 'オ', romaji: ['o'] },
            { char: 'カ', romaji: ['ka'] },
            { char: 'キ', romaji: ['ki'] },
            { char: 'ク', romaji: ['ku'] },
            { char: 'ケ', romaji: ['ke'] },
            { char: 'コ', romaji: ['ko'] },
            { char: 'サ', romaji: ['sa'] },
            { char: 'シ', romaji: ['shi', 'si'] },
            { char: 'ス', romaji: ['su'] },
            { char: 'セ', romaji: ['se'] },
            { char: 'ソ', romaji: ['so'] }
        ],
        section2: [
            { char: 'タ', romaji: ['ta'] },
            { char: 'チ', romaji: ['chi', 'ti'] },
            { char: 'ツ', romaji: ['tsu', 'tu'] },
            { char: 'テ', romaji: ['te'] },
            { char: 'ト', romaji: ['to'] },
            { char: 'ナ', romaji: ['na'] },
            { char: 'ニ', romaji: ['ni'] },
            { char: 'ヌ', romaji: ['nu'] },
            { char: 'ネ', romaji: ['ne'] },
            { char: 'ノ', romaji: ['no'] },
            { char: 'ハ', romaji: ['ha'] },
            { char: 'ヒ', romaji: ['hi'] },
            { char: 'フ', romaji: ['fu', 'hu'] },
            { char: 'ヘ', romaji: ['he'] },
            { char: 'ホ', romaji: ['ho'] }
        ],
        section3: [
            { char: 'マ', romaji: ['ma'] },
            { char: 'ミ', romaji: ['mi'] },
            { char: 'ム', romaji: ['mu'] },
            { char: 'メ', romaji: ['me'] },
            { char: 'モ', romaji: ['mo'] },
            { char: 'ヤ', romaji: ['ya'] },
            { char: 'ユ', romaji: ['yu'] },
            { char: 'ヨ', romaji: ['yo'] },
            { char: 'ラ', romaji: ['ra'] },
            { char: 'リ', romaji: ['ri'] },
            { char: 'ル', romaji: ['ru'] },
            { char: 'レ', romaji: ['re'] },
            { char: 'ロ', romaji: ['ro'] },
            { char: 'ワ', romaji: ['wa'] },
            { char: 'ヲ', romaji: ['wo', 'o'] },
            { char: 'ン', romaji: ['n', 'nn'] }
        ]
    },

    kanji: {
        section1: [
            { char: '一', readings: ['いち', 'ひとつ'], romaji: ['ichi', 'hitotsu'] },
            { char: '二', readings: ['に', 'ふたつ'], romaji: ['ni', 'futatsu'] },
            { char: '三', readings: ['さん', 'みっつ'], romaji: ['san', 'mittsu'] },
            { char: '四', readings: ['し', 'よん', 'よっつ'], romaji: ['shi', 'yon', 'yottsu'] },
            { char: '五', readings: ['ご', 'いつつ'], romaji: ['go', 'itsutsu'] },
            { char: '六', readings: ['ろく', 'むっつ'], romaji: ['roku', 'muttsu'] },
            { char: '七', readings: ['なな', 'しち', 'ななつ'], romaji: ['nana', 'shichi', 'nanatsu'] },
            { char: '八', readings: ['はち', 'やっつ'], romaji: ['hachi', 'yattsu'] },
            { char: '九', readings: ['きゅう', 'く', 'ここのつ'], romaji: ['kyuu', 'kyu', 'ku', 'kokonotsu'] },
            { char: '十', readings: ['じゅう', 'とお'], romaji: ['juu', 'ju', 'too', 'to'] }
        ],
        section2: [
            { char: '百', readings: ['ひゃく'], romaji: ['hyaku'] },
            { char: '千', readings: ['せん'], romaji: ['sen'] },
            { char: '人', readings: ['ひと', 'にん', 'じん'], romaji: ['hito', 'nin', 'jin'] },
            { char: '日', readings: ['ひ', 'か', 'にち'], romaji: ['hi', 'ka', 'nichi'] },
            { char: '月', readings: ['つき', 'げつ', 'がつ'], romaji: ['tsuki', 'getsu', 'gatsu'] },
            { char: '火', readings: ['ひ', 'か'], romaji: ['hi', 'ka'] },
            { char: '水', readings: ['みず', 'すい'], romaji: ['mizu', 'sui'] },
            { char: '木', readings: ['き', 'もく'], romaji: ['ki', 'moku'] },
            { char: '金', readings: ['かね', 'きん'], romaji: ['kane', 'kin'] },
            { char: '土', readings: ['つち', 'ど'], romaji: ['tsuchi', 'do'] }
        ],
        section3: [
            { char: '大', readings: ['おお', 'だい', 'たい'], romaji: ['oo', 'oh', 'dai', 'tai'] },
            { char: '小', readings: ['ちい', 'しょう', 'こ'], romaji: ['chii', 'shou', 'sho', 'ko'] },
            { char: '中', readings: ['なか', 'ちゅう'], romaji: ['naka', 'chuu', 'chu'] },
            { char: '上', readings: ['うえ', 'かみ', 'じょう'], romaji: ['ue', 'kami', 'jou', 'jo'] },
            { char: '下', readings: ['した', 'しも', 'げ', 'か'], romaji: ['shita', 'shimo', 'ge', 'ka'] },
            { char: '左', readings: ['ひだり'], romaji: ['hidari'] },
            { char: '右', readings: ['みぎ', 'ゆう'], romaji: ['migi', 'yuu', 'yu'] },
            { char: '本', readings: ['ほん', 'もと'], romaji: ['hon', 'moto'] },
            { char: '国', readings: ['くに', 'こく'], romaji: ['kuni', 'koku'] },
            { char: '年', readings: ['とし', 'ねん'], romaji: ['toshi', 'nen'] },
            { char: '語', readings: ['ご', 'かた'], romaji: ['go', 'kata'] },
            { char: '学', readings: ['がく', 'まな'], romaji: ['gaku', 'mana'] }
        ]
    }
};romaji: 'oo, dai, tai' },
            { char: '小', reading: ['しょう', 'ちい', 'こ'], romaji: 'shou, chii, ko' },
            { char: '中', reading: ['ちゅう', 'なか'], romaji: 'chuu, naka' },
            { char: '上', reading: ['うえ', 'かみ', 'じょう'], romaji: 'ue, kami, jou' },
            { char: '下', reading: ['した', 'しも', 'げ', 'か'], romaji: 'shita, shimo, ge, ka' },
            { char: '左', reading: ['ひだり'], romaji: 'hidari' },
            { char: '右', reading: ['みぎ', 'ゆう'], romaji: 'migi, yuu' },
            { char: '本', reading: ['ほん'], romaji: 'hon' },
            { char: '国', reading: ['くに'], romaji: 'kuni' },
            { char: '年', reading: ['とし'], romaji: 'toshi' },
            { char: '語', reading: ['ご'], romaji: 'go' },
            { char: '学', reading: ['がく'], romaji: 'gaku' }
        ]
    }
};��ら'], romaji: 'mura' },
        { char: '町', reading: ['まち'], romaji: 'machi' }
    ]
};