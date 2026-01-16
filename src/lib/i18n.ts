// Internationalization - translations and language management

export type Language = 'en' | 'uz' | 'ru';

export interface LanguageOption {
  code: Language;
  name: string;
  flag: string; // Flag emoji or URL
  nativeName: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'uz', name: 'Uzbek', nativeName: 'O\'zbek', flag: '🇺🇿' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
];

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Home page
    'welcome_back': 'Welcome back',
    'score': 'Score',
    'quizzes': 'Quizzes',
    'correct': 'Correct',
    'accuracy': 'Accuracy',
    'add': 'Add',
    'no_quizzes': 'No quizzes yet',
    'upload_first_quiz': 'Upload your first quiz to get started!',
    'upload_quiz': 'Upload Quiz',
    'questions': 'questions',
    
    // Quiz settings
    'quiz_settings': 'Quiz Settings',
    'questions_total': 'questions total',
    'shuffle_questions': 'Shuffle Questions',
    'randomize_order': 'Randomize order',
    'shuffle_answers': 'Shuffle Answers',
    'randomize_options': 'Randomize options',
    'fast_mode': 'Fast Mode',
    'auto_advance': 'Auto-advance questions',
    'question_range': 'Question Range',
    'practice_specific': 'Practice specific part',
    'from': 'From',
    'to': 'To',
    'total': 'Total',
    'start_quiz': 'Start Quiz',
    
    // Quiz play
    'paused': 'Paused',
    'take_your_time': 'Take your time',
    'resume': 'Resume',
    'exit_quiz': 'Exit Quiz?',
    'progress_not_saved': 'Your progress will not be saved. Are you sure?',
    'exit': 'Exit',
    'continue': 'Continue',
    'view_results': 'View Results',
    'next': 'Next',
    
    // Results
    'quiz_complete': 'Quiz Complete!',
    'score_correct': 'Score: {correct} / {total} correct',
    'wrong': 'Wrong',
    'time': 'Time',
    'achievement': 'Achievement',
    'answers': 'Answers',
    'hide': 'Hide',
    'retry_wrong': 'Retry Wrong',
    'restart': 'Restart',
    'home': 'Home',
    'answer_review': 'Answer Review',
    'wrong_only': 'Wrong Only',
    'all': 'All',
    'question': 'Question',
    'your': 'Your',
    'result': 'Result',
    'close': 'Close',
    
    // Settings
    'settings': 'Settings',
    'change_photo': 'Change photo',
    'name': 'Name',
    'enter_your_name': 'Enter your name',
    'cancel': 'Cancel',
    'save': 'Save',
    'language': 'Language',
    
    // Onboarding
    'welcome_emoji': '👋',
    'lets_get_started': "Let's get started!",
    'enter_name_continue': 'Enter your name to continue',
    'add_photo_optional': 'Add a photo (optional)',
    'get_started': 'Get Started',
    
    // Badges
    'gold_medal': 'Gold Medal',
    'silver_medal': 'Silver Medal',
    'bronze_medal': 'Bronze Medal',
    'participant': 'Participant',
    'outstanding': 'Outstanding!',
    'great_job': 'Great job!',
    'good_effort': 'Good effort!',
    'keep_practicing': 'Keep practicing!',
    
    // Delete
    'delete_quiz': 'Delete Quiz',
    'delete_confirm': 'Are you sure you want to delete "{name}"? This action cannot be undone.',
    'delete': 'Delete',
  },
  uz: {
    // Home page
    'welcome_back': 'Xush kelibsiz',
    'score': 'Ball',
    'quizzes': 'Testlar',
    'correct': 'To\'g\'ri',
    'accuracy': 'Aniqlik',
    'add': 'Qo\'shish',
    'no_quizzes': 'Hali testlar yo\'q',
    'upload_first_quiz': 'Boshlash uchun birinchi testingizni yuklang!',
    'upload_quiz': 'Test yuklash',
    'questions': 'savol',
    
    // Quiz settings
    'quiz_settings': 'Test sozlamalari',
    'questions_total': 'jami savol',
    'shuffle_questions': 'Savollarni aralashtirish',
    'randomize_order': 'Tartibni tasodifiy',
    'shuffle_answers': 'Javoblarni aralashtirish',
    'randomize_options': 'Variantlarni tasodifiy',
    'fast_mode': 'Tez rejim',
    'auto_advance': 'Avtomatik o\'tish',
    'question_range': 'Savol oralig\'i',
    'practice_specific': 'Aniq qismni mashq qilish',
    'from': 'Dan',
    'to': 'Gacha',
    'total': 'Jami',
    'start_quiz': 'Testni boshlash',
    
    // Quiz play
    'paused': 'To\'xtatildi',
    'take_your_time': 'Vaqt oling',
    'resume': 'Davom etish',
    'exit_quiz': 'Testdan chiqish?',
    'progress_not_saved': 'Jarayon saqlanmaydi. Ishonchingiz komilmi?',
    'exit': 'Chiqish',
    'continue': 'Davom etish',
    'view_results': 'Natijalarni ko\'rish',
    'next': 'Keyingi',
    
    // Results
    'quiz_complete': 'Test tugadi!',
    'score_correct': 'Ball: {correct} / {total} to\'g\'ri',
    'wrong': 'Noto\'g\'ri',
    'time': 'Vaqt',
    'achievement': 'Yutuq',
    'answers': 'Javoblar',
    'hide': 'Yashirish',
    'retry_wrong': 'Xatolarni qayta',
    'restart': 'Qayta boshlash',
    'home': 'Bosh sahifa',
    'answer_review': 'Javoblarni ko\'rish',
    'wrong_only': 'Faqat xato',
    'all': 'Hammasi',
    'question': 'Savol',
    'your': 'Sizning',
    'result': 'Natija',
    'close': 'Yopish',
    
    // Settings
    'settings': 'Sozlamalar',
    'change_photo': 'Rasmni o\'zgartirish',
    'name': 'Ism',
    'enter_your_name': 'Ismingizni kiriting',
    'cancel': 'Bekor qilish',
    'save': 'Saqlash',
    'language': 'Til',
    
    // Onboarding
    'welcome_emoji': '👋',
    'lets_get_started': 'Boshladik!',
    'enter_name_continue': 'Davom etish uchun ismingizni kiriting',
    'add_photo_optional': 'Rasm qo\'shing (ixtiyoriy)',
    'get_started': 'Boshlash',
    
    // Badges
    'gold_medal': 'Oltin medal',
    'silver_medal': 'Kumush medal',
    'bronze_medal': 'Bronza medal',
    'participant': 'Ishtirokchi',
    'outstanding': 'Ajoyib!',
    'great_job': 'Yaxshi ish!',
    'good_effort': 'Yaxshi harakat!',
    'keep_practicing': 'Mashq qiling!',
    
    // Delete
    'delete_quiz': 'Testni o\'chirish',
    'delete_confirm': '"{name}" testini o\'chirishni xohlaysizmi? Bu amalni qaytarib bo\'lmaydi.',
    'delete': 'O\'chirish',
  },
  ru: {
    // Home page
    'welcome_back': 'С возвращением',
    'score': 'Баллы',
    'quizzes': 'Тесты',
    'correct': 'Верно',
    'accuracy': 'Точность',
    'add': 'Добавить',
    'no_quizzes': 'Тестов пока нет',
    'upload_first_quiz': 'Загрузите первый тест, чтобы начать!',
    'upload_quiz': 'Загрузить тест',
    'questions': 'вопросов',
    
    // Quiz settings
    'quiz_settings': 'Настройки теста',
    'questions_total': 'всего вопросов',
    'shuffle_questions': 'Перемешать вопросы',
    'randomize_order': 'Случайный порядок',
    'shuffle_answers': 'Перемешать ответы',
    'randomize_options': 'Случайные варианты',
    'fast_mode': 'Быстрый режим',
    'auto_advance': 'Авто-переход',
    'question_range': 'Диапазон вопросов',
    'practice_specific': 'Практиковать часть',
    'from': 'От',
    'to': 'До',
    'total': 'Всего',
    'start_quiz': 'Начать тест',
    
    // Quiz play
    'paused': 'Пауза',
    'take_your_time': 'Не спешите',
    'resume': 'Продолжить',
    'exit_quiz': 'Выйти из теста?',
    'progress_not_saved': 'Прогресс не будет сохранён. Вы уверены?',
    'exit': 'Выйти',
    'continue': 'Продолжить',
    'view_results': 'Посмотреть результаты',
    'next': 'Далее',
    
    // Results
    'quiz_complete': 'Тест завершён!',
    'score_correct': 'Баллы: {correct} / {total} верно',
    'wrong': 'Неверно',
    'time': 'Время',
    'achievement': 'Достижение',
    'answers': 'Ответы',
    'hide': 'Скрыть',
    'retry_wrong': 'Повторить ошибки',
    'restart': 'Заново',
    'home': 'Главная',
    'answer_review': 'Обзор ответов',
    'wrong_only': 'Только ошибки',
    'all': 'Все',
    'question': 'Вопрос',
    'your': 'Ваш',
    'result': 'Результат',
    'close': 'Закрыть',
    
    // Settings
    'settings': 'Настройки',
    'change_photo': 'Изменить фото',
    'name': 'Имя',
    'enter_your_name': 'Введите ваше имя',
    'cancel': 'Отмена',
    'save': 'Сохранить',
    'language': 'Язык',
    
    // Onboarding
    'welcome_emoji': '👋',
    'lets_get_started': 'Давайте начнём!',
    'enter_name_continue': 'Введите имя, чтобы продолжить',
    'add_photo_optional': 'Добавьте фото (необязательно)',
    'get_started': 'Начать',
    
    // Badges
    'gold_medal': 'Золотая медаль',
    'silver_medal': 'Серебряная медаль',
    'bronze_medal': 'Бронзовая медаль',
    'participant': 'Участник',
    'outstanding': 'Превосходно!',
    'great_job': 'Отлично!',
    'good_effort': 'Хорошая попытка!',
    'keep_practicing': 'Продолжайте!',
    
    // Delete
    'delete_quiz': 'Удалить тест',
    'delete_confirm': 'Вы уверены, что хотите удалить "{name}"? Это действие нельзя отменить.',
    'delete': 'Удалить',
  },
};

const LANGUAGE_KEY = 'quizmaster-language';

export function getCurrentLanguage(): Language {
  const saved = localStorage.getItem(LANGUAGE_KEY);
  if (saved && (saved === 'en' || saved === 'uz' || saved === 'ru')) {
    return saved;
  }
  return 'en';
}

export function setCurrentLanguage(lang: Language): void {
  localStorage.setItem(LANGUAGE_KEY, lang);
}

export function t(key: string, params?: Record<string, string | number>): string {
  const lang = getCurrentLanguage();
  let text = translations[lang][key] || translations['en'][key] || key;
  
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, String(v));
    });
  }
  
  return text;
}
