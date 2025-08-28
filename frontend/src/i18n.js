import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  uk: {
    translation: {
      login: 'Вхід',
      username: 'Ім\'я користувача',
      password: 'Пароль',
      dashboard: 'Панель керування',
      workForm: 'Форма роботи',
      admin: 'Адміністратор',
      logout: 'Вихід',
      workDate: 'Дата роботи',
      startTime: 'Час початку',
      endTime: 'Час завершення',
      description: 'Опис',
      photo: 'Фото',
      submit: 'Надіслати',
      workEntries: 'Записи роботи',
      addWorkEntry: 'Додати запис роботи',
      viewAll: 'Переглянути всю роботу'
    }
  },
  cs: {
    translation: {
      login: 'Přihlášení',
      username: 'Uživatelské jméno',
      password: 'Heslo',
      dashboard: 'Přehled',
      workForm: 'Formulář práce',
      admin: 'Admin',
      logout: 'Odhlásit',
      workDate: 'Datum práce',
      startTime: 'Čas zahájení',
      endTime: 'Čas ukončení',
      description: 'Popis',
      photo: 'Fotografie',
      submit: 'Odeslat',
      workEntries: 'Záznamy práce',
      addWorkEntry: 'Přidat záznam práce',
      viewAll: 'Zobrazit všechnu práci'
    }
  },
  uz: {
    translation: {
      login: 'Kirish',
      username: 'Foydalanuvchi nomi',
      password: 'Parol',
      dashboard: 'Boshqaruv paneli',
      workForm: 'Ish shakli',
      admin: 'Administrator',
      logout: 'Chiqish',
      workDate: 'Ish sanasi',
      startTime: 'Boshlanish vaqti',
      endTime: 'Tugash vaqti',
      description: 'Tavsif',
      photo: 'Rasm',
      submit: 'Yuborish',
      workEntries: 'Ish yozuvlari',
      addWorkEntry: 'Ish yozuvi qo\'shish',
      viewAll: 'Barcha ishlarni ko\'rish'
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'cs',
    fallbackLng: 'cs',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;