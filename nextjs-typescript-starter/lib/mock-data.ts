export type BookRow = {
  id: string;
  title: string;
  wordCount: number;
  coverUrl: string | null;
  bookId: string;
  tags: string[];
};

export type UserRow = {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
};

export type LearningProgressRow = {
  id: string;
  userId: string;
  bookId: string;
  lastWordId: string | null;
  lastWordRank: number | null;
  learnedCount: number;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type WordContent = {
  word?: {
    wordHead?: string;
    wordId?: string;
    content?: {
      usphone?: string;
      ukphone?: string;
      phone?: string;
      trans?: Array<{
        tranCn?: string;
        tranOther?: string;
      }>;
      sentence?: {
        sentences?: Array<{
          sContent?: string;
          sCn?: string;
        }>;
      };
      phrase?: {
        phrases?: Array<{
          pContent?: string;
          pCn?: string;
        }>;
      };
      syno?: {
        synos?: Array<{
          pos?: string;
          tran?: string;
          hwds?: Array<{ w?: string }>;
        }>;
      };
      relWord?: {
        rels?: Array<{
          pos?: string;
          words?: Array<{
            hwd?: string;
            tran?: string;
          }>;
        }>;
      };
      remMethod?: {
        val?: string;
        desc?: string;
      };
    };
  };
};

export type WordRow = {
  id: string;
  wordRank: number | null;
  headWord: string | null;
  content: WordContent | null;
  bookId: string | null;
};

const CREATED_AT = '2026-08-01T08:00:00.000Z';

export const MOCK_BOOKS: BookRow[] = [
  {
    id: '6b371748-b934-4aa1-b906-118de3e69a01',
    title: 'PEP 小学三年级',
    wordCount: 8,
    coverUrl: '/covers/pep-grade-3.svg',
    bookId: 'PEPXiaoXue3_1',
    tags: ['小学', '人教版', '入门'],
  },
  {
    id: '6b371748-b934-4aa1-b906-118de3e69a02',
    title: 'PEP 小学六年级',
    wordCount: 6,
    coverUrl: '/covers/pep-grade-6.svg',
    bookId: 'PEPXiaoXue6_1',
    tags: ['小学', '人教版', '进阶'],
  },
  {
    id: '6b371748-b934-4aa1-b906-118de3e69a03',
    title: '初中核心词汇',
    wordCount: 6,
    coverUrl: '/covers/junior-core.svg',
    bookId: 'JuniorCore_1',
    tags: ['初中', '核心词汇'],
  },
];

type WordSeed = {
  id: string;
  rank: number;
  word: string;
  bookId: string;
  usphone?: string;
  ukphone?: string;
  translation: string;
  definition?: string;
  sentence?: [string, string];
  phrases?: Array<[string, string]>;
  synonyms?: string[];
  related?: Array<[string, string]>;
  memory?: string;
};

function createWord(seed: WordSeed): WordRow {
  return {
    id: seed.id,
    wordRank: seed.rank,
    headWord: seed.word,
    bookId: seed.bookId,
    content: {
      word: {
        wordHead: seed.word,
        wordId: `mock-${seed.id}`,
        content: {
          usphone: seed.usphone,
          ukphone: seed.ukphone,
          trans: [
            {
              tranCn: seed.translation,
              tranOther: seed.definition,
            },
          ],
          sentence: seed.sentence
            ? {
                sentences: [
                  {
                    sContent: seed.sentence[0],
                    sCn: seed.sentence[1],
                  },
                ],
              }
            : undefined,
          phrase: seed.phrases
            ? {
                phrases: seed.phrases.map(([pContent, pCn]) => ({
                  pContent,
                  pCn,
                })),
              }
            : undefined,
          syno: seed.synonyms
            ? {
                synos: [
                  {
                    pos: '近义词',
                    tran: seed.translation,
                    hwds: seed.synonyms.map((word) => ({ w: word })),
                  },
                ],
              }
            : undefined,
          relWord: seed.related
            ? {
                rels: [
                  {
                    pos: '相关词',
                    words: seed.related.map(([hwd, tran]) => ({ hwd, tran })),
                  },
                ],
              }
            : undefined,
          remMethod: seed.memory
            ? {
                val: seed.memory,
                desc: '联想记忆',
              }
            : undefined,
        },
      },
    },
  };
}

export const MOCK_WORDS: WordRow[] = [
  createWord({
    id: '1001',
    rank: 1,
    word: 'ruler',
    bookId: 'PEPXiaoXue3_1',
    usphone: 'ˈruːlər',
    ukphone: 'ˈruːlə',
    translation: 'n. 尺子；统治者',
    definition: 'a long, narrow object used for measuring or drawing lines',
    sentence: ['This ruler is thirty centimetres long.', '这把尺子长三十厘米。'],
    phrases: [
      ['a wooden ruler', '一把木尺'],
      ['measure with a ruler', '用尺子测量'],
    ],
    synonyms: ['measure', 'governor'],
    related: [
      ['rule', 'n. 规则；v. 统治'],
      ['ruling', 'adj. 统治的'],
    ],
    memory: 'rule 是“规则”，ruler 既可以是制定规则的人，也可以是画直线的尺子。',
  }),
  createWord({
    id: '1002',
    rank: 2,
    word: 'pencil',
    bookId: 'PEPXiaoXue3_1',
    usphone: 'ˈpensl',
    ukphone: 'ˈpensl',
    translation: 'n. 铅笔',
    definition: 'an instrument used for writing or drawing',
    sentence: ['I write my name with a pencil.', '我用铅笔写下名字。'],
    phrases: [['pencil box', '铅笔盒']],
    related: [['pencil case', '铅笔袋']],
  }),
  createWord({
    id: '1003',
    rank: 3,
    word: 'eraser',
    bookId: 'PEPXiaoXue3_1',
    usphone: 'ɪˈreɪsər',
    ukphone: 'ɪˈreɪzə',
    translation: 'n. 橡皮',
    definition: 'a small object used for removing pencil marks',
    sentence: ['May I use your eraser?', '我可以用一下你的橡皮吗？'],
    related: [['erase', 'v. 擦除']],
  }),
  createWord({
    id: '1004',
    rank: 4,
    word: 'crayon',
    bookId: 'PEPXiaoXue3_1',
    usphone: 'ˈkreɪən',
    ukphone: 'ˈkreɪən',
    translation: 'n. 蜡笔',
    definition: 'a coloured stick used for drawing',
    sentence: ['The child drew a sun with a yellow crayon.', '孩子用黄色蜡笔画了一个太阳。'],
  }),
  createWord({
    id: '1005',
    rank: 5,
    word: 'schoolbag',
    bookId: 'PEPXiaoXue3_1',
    usphone: 'ˈskuːlbæɡ',
    ukphone: 'ˈskuːlbæɡ',
    translation: 'n. 书包',
    sentence: ['My books are in the schoolbag.', '我的书都在书包里。'],
    memory: 'school（学校）+ bag（包）= schoolbag（书包）。',
  }),
  createWord({
    id: '1006',
    rank: 6,
    word: 'book',
    bookId: 'PEPXiaoXue3_1',
    usphone: 'bʊk',
    ukphone: 'bʊk',
    translation: 'n. 书；v. 预订',
    sentence: ['This is my favourite English book.', '这是我最喜欢的英语书。'],
    phrases: [['read a book', '读书']],
  }),
  createWord({
    id: '1007',
    rank: 7,
    word: 'teacher',
    bookId: 'PEPXiaoXue3_1',
    usphone: 'ˈtiːtʃər',
    ukphone: 'ˈtiːtʃə',
    translation: 'n. 教师',
    sentence: ['Our English teacher is very kind.', '我们的英语老师非常亲切。'],
    related: [['teach', 'v. 教；教授']],
  }),
  createWord({
    id: '1008',
    rank: 8,
    word: 'friend',
    bookId: 'PEPXiaoXue3_1',
    usphone: 'frend',
    ukphone: 'frend',
    translation: 'n. 朋友',
    sentence: ['Amy is my good friend.', '艾米是我的好朋友。'],
    related: [['friendly', 'adj. 友好的']],
  }),

  createWord({
    id: '2001',
    rank: 1,
    word: 'science',
    bookId: 'PEPXiaoXue6_1',
    usphone: 'ˈsaɪəns',
    ukphone: 'ˈsaɪəns',
    translation: 'n. 科学',
    sentence: ['Science helps us understand the world.', '科学帮助我们理解世界。'],
    related: [['scientist', 'n. 科学家']],
  }),
  createWord({
    id: '2002',
    rank: 2,
    word: 'museum',
    bookId: 'PEPXiaoXue6_1',
    usphone: 'mjuˈziːəm',
    ukphone: 'mjuˈziːəm',
    translation: 'n. 博物馆',
    sentence: ['We visited the science museum yesterday.', '昨天我们参观了科学博物馆。'],
  }),
  createWord({
    id: '2003',
    rank: 3,
    word: 'healthy',
    bookId: 'PEPXiaoXue6_1',
    usphone: 'ˈhelθi',
    ukphone: 'ˈhelθi',
    translation: 'adj. 健康的',
    sentence: ['Fresh vegetables keep us healthy.', '新鲜蔬菜让我们保持健康。'],
    related: [['health', 'n. 健康']],
  }),
  createWord({
    id: '2004',
    rank: 4,
    word: 'travel',
    bookId: 'PEPXiaoXue6_1',
    usphone: 'ˈtrævl',
    ukphone: 'ˈtrævl',
    translation: 'v. 旅行；行进',
    sentence: ['I want to travel around China.', '我想环游中国。'],
    synonyms: ['journey', 'tour'],
  }),
  createWord({
    id: '2005',
    rank: 5,
    word: 'future',
    bookId: 'PEPXiaoXue6_1',
    usphone: 'ˈfjuːtʃər',
    ukphone: 'ˈfjuːtʃə',
    translation: 'n. 将来；未来',
    sentence: ['What do you want to be in the future?', '将来你想成为什么？'],
  }),
  createWord({
    id: '2006',
    rank: 6,
    word: 'protect',
    bookId: 'PEPXiaoXue6_1',
    usphone: 'prəˈtekt',
    ukphone: 'prəˈtekt',
    translation: 'v. 保护',
    sentence: ['We should protect the environment.', '我们应该保护环境。'],
    related: [['protection', 'n. 保护']],
  }),

  createWord({
    id: '3001',
    rank: 1,
    word: 'achieve',
    bookId: 'JuniorCore_1',
    usphone: 'əˈtʃiːv',
    ukphone: 'əˈtʃiːv',
    translation: 'v. 实现；取得',
    sentence: ['Small steps help us achieve big goals.', '小小的步伐帮助我们实现大目标。'],
    related: [['achievement', 'n. 成就']],
  }),
  createWord({
    id: '3002',
    rank: 2,
    word: 'curious',
    bookId: 'JuniorCore_1',
    usphone: 'ˈkjʊriəs',
    ukphone: 'ˈkjʊəriəs',
    translation: 'adj. 好奇的',
    sentence: ['Children are curious about everything.', '孩子们对一切都很好奇。'],
    related: [['curiosity', 'n. 好奇心']],
  }),
  createWord({
    id: '3003',
    rank: 3,
    word: 'improve',
    bookId: 'JuniorCore_1',
    usphone: 'ɪmˈpruːv',
    ukphone: 'ɪmˈpruːv',
    translation: 'v. 提高；改善',
    sentence: ['Reading can improve your vocabulary.', '阅读可以提高你的词汇量。'],
    related: [['improvement', 'n. 改进']],
  }),
  createWord({
    id: '3004',
    rank: 4,
    word: 'journey',
    bookId: 'JuniorCore_1',
    usphone: 'ˈdʒɜːrni',
    ukphone: 'ˈdʒɜːni',
    translation: 'n. 旅行；历程',
    sentence: ['Learning a language is a long journey.', '学习一门语言是一段漫长的旅程。'],
    synonyms: ['trip', 'travel'],
  }),
  createWord({
    id: '3005',
    rank: 5,
    word: 'practice',
    bookId: 'JuniorCore_1',
    usphone: 'ˈpræktɪs',
    ukphone: 'ˈpræktɪs',
    translation: 'n. 练习；v. 实践',
    sentence: ['Practice makes perfect.', '熟能生巧。'],
    phrases: [['put into practice', '付诸实践']],
  }),
  createWord({
    id: '3006',
    rank: 6,
    word: 'responsible',
    bookId: 'JuniorCore_1',
    usphone: 'rɪˈspɑːnsəbl',
    ukphone: 'rɪˈspɒnsəbl',
    translation: 'adj. 负责的',
    sentence: ['We are responsible for our choices.', '我们要为自己的选择负责。'],
    related: [['responsibility', 'n. 责任']],
  }),
];

export const DEMO_USER: UserRow = {
  id: '7c616355-a7af-40d8-89ba-1c20732660a1',
  email: 'demo@wordisland.com',
  passwordHash: 'ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f',
  createdAt: CREATED_AT,
  updatedAt: CREATED_AT,
};

export const DEMO_PROGRESS: LearningProgressRow = {
  id: 'a15b3e51-bd53-4ae5-a87e-a95b23d64001',
  userId: DEMO_USER.id,
  bookId: 'PEPXiaoXue3_1',
  lastWordId: '1002',
  lastWordRank: 2,
  learnedCount: 2,
  completedAt: null,
  createdAt: '2026-08-26T10:00:00.000Z',
  updatedAt: '2026-08-27T10:30:00.000Z',
};

export function getBookByBookId(bookId: string) {
  return MOCK_BOOKS.find((book) => book.bookId === bookId) ?? null;
}

export function getWordsByBookId(bookId: string) {
  return MOCK_WORDS.filter(
    (word): word is WordRow & { wordRank: number; bookId: string } =>
      word.bookId === bookId && word.wordRank !== null,
  ).sort((a, b) => a.wordRank - b.wordRank);
}

export function getWordById(wordId: string) {
  return MOCK_WORDS.find((word) => word.id === wordId) ?? null;
}

export function parseBookTags(tags: string[] | string | null) {
  const values = Array.isArray(tags) ? tags : (tags ?? '').split(',');

  return values
    .map((tag) => tag.trim())
    .filter(Boolean);
}
