/* Навигация и уведомления. */
export const USER = { first: 'Руководитель', name: 'Руководитель', email: 'отель Golden Dragon' };

export const TABS = [
  { id: 'dashboard', label: 'Сводка' },
  { id: 'shifts', label: 'Смены' },
  { id: 'camera', label: 'Камера' },
  { id: 'talks', label: 'Разговоры' },
  { id: 'analytics', label: 'Аналитика' },
  { id: 'calendar', label: 'График' },
];

export const HOME_LINKS = [
  { id: 'reports', label: 'Отчёты за смену', icon: 'statement' },
  { id: 'phone', label: 'Служебный телефон', icon: 'phone' },
  { id: 'settings', label: 'Настройки', icon: 'settings' },
];

export const CHANNEL_LINKS = [
  { id: 'whatsapp', label: 'WhatsApp', icon: 'message' },
  { id: 'mail', label: 'Почта Outlook', icon: 'mail' },
  { id: 'booking', label: 'Отзывы Booking', icon: 'star' },
];

export const NOTIFICATIONS = [
  { id: 'n1', icon: 'statement', title: 'Отчёт за дневную смену готов', text: 'Айгерим и Бакыт · оценка 7,2', time: '20:00', unread: true, modal: ['shift', { id: 'd10' }] },
  { id: 'n2', icon: 'camera', title: 'Нургуль пришла на смену', text: 'Камера ресепшена · 19:52', time: '19:52', unread: true, go: 'shifts' },
  { id: 'n3', icon: 'alert', title: 'Спор у стойки, оценка 3', text: 'Айгерим · счёт за мини-бар', time: '13:27', unread: true, modal: ['talk', { id: 'c4' }] },
  { id: 'n4', icon: 'mail', title: 'Письмо без ответа 5 часов', text: 'Гость просит счёт для компании', time: '16:20', unread: false, go: 'channel', param: 'mail' },
];
