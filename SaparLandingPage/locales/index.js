import { uz } from './uz';
import { oz } from './oz';
import { ru } from './ru';
import { en } from './en';

export const locales = {
    uz,
    oz,
    ru,
    en,
};

export const languages = [
    { code: 'uz', name: 'O‘zbekcha', script: 'Lotin', label: 'UZ', fullLabel: 'O‘zbek (Lotin)', flag: '🇺🇿' },
    { code: 'oz', name: 'Ўзбекча', script: 'Кирилл', label: 'ЎЗ', fullLabel: 'Ўзбек (Кирилл)', flag: '🇺🇿' },
    { code: 'ru', name: 'Русский', script: '', label: 'RU', fullLabel: 'Русский', flag: '🇷🇺' },
    { code: 'en', name: 'English', script: '', label: 'EN', fullLabel: 'English', flag: '🇬🇧' },
];

export const defaultLanguage = 'uz';
