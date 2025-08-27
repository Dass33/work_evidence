import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      login: 'Login',
      username: 'Username',
      password: 'Password',
      dashboard: 'Dashboard',
      workForm: 'Work Form',
      admin: 'Admin',
      logout: 'Logout',
      workDate: 'Work Date',
      startTime: 'Start Time',
      endTime: 'End Time',
      description: 'Description',
      photo: 'Photo',
      submit: 'Submit',
      workEntries: 'Work Entries',
      addWorkEntry: 'Add Work Entry',
      viewAll: 'View All Work'
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
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;