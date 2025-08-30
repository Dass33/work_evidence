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
      viewAll: 'Zobrazit všechnu práci',
      loading: 'Načítání...',
      cancel: 'Zrušit',
      save: 'Uložit',
      edit: 'Upravit',
      delete: 'Smazat',
      create: 'Vytvořit',
      add: 'Přidat',
      remove: 'Odebrat',
      update: 'Aktualizovat',
      networkError: 'Chyba sítě. Zkuste to prosím znovu.',
      noWorkEntriesFound: 'Nenalezeny žádné záznamy práce',
      addFirstEntry: 'Přidejte svůj první záznam',
      workEvidence: 'Pracovní důkaz',
      allUsers: 'Všichni uživatelé',
      startDate: 'Datum začátku',
      endDate: 'Datum konce',
      userManagement: 'Správa uživatelů',
      projectManagement: 'Správa projektů',
      filterByUser: 'Filtrovat podle uživatele',
      totalEntries: 'Celkem záznamů',
      activeWorkers: 'Aktivní pracovníci',
      totalHours: 'Celkem hodin',
      usernamePasswordRequired: 'Uživatelské jméno a heslo jsou povinné',
      confirmDeleteUser: 'Jste si jisti, že chcete smazat uživatele "{{username}}"? Tato akce se nedá vrátit zpět a smaže také všechny jejich pracovní záznamy.',
      addWorker: 'Přidat pracovníka',
      creating: 'Vytváří se...',
      createUser: 'Vytvořit uživatele',
      created: 'Vytvořeno',
      noUsersFound: 'Nenalezeni žádní uživatelé',
      role: 'Role',
      worker: 'Pracovník',
      addProject: 'Přidat projekt',
      projectName: 'Název projektu',
      hideFromWorkers: 'Skrýt před pracovníky',
      createProject: 'Vytvořit projekt',
      saving: 'Ukládá se...',
      noProjectsFound: 'Nenalezeny žádné projekty',
      hidden: 'Skrytý',
      visible: 'Viditelný',
      confirmDeleteProject: 'Jste si jisti, že chcete smazat projekt "{{projectName}}"? Tato akce se nedá vrátit zpět.',
      projectNameRequired: 'Název projektu je povinný',
      failedCreateProject: 'Nepodařilo se vytvořit projekt',
      failedUpdateProject: 'Nepodařilo se aktualizovat projekt',
      failedDeleteProject: 'Nepodařilo se smazat projekt',
      failedCreateUser: 'Nepodařilo se vytvořit uživatele',
      failedDeleteUser: 'Nepodařilo se smazat uživatele',
      loginFailed: 'Přihlášení se nezdařilo',
      failedFetchData: 'Nepodařilo se načíst data',
      noEntriesForFilters: 'Pro vybrané filtry nebyly nalezeny žádné pracovní záznamy.',
      describePlaceholder: 'Popište své pracovní aktivity...',
      preview: 'Náhled',
      photos: 'Fotografie',
      multiple: 'vícenásobný',
      photoSelected: 'fotografie vybrána',
      photosSelected: 'fotografií vybráno'
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