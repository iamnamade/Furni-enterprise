import fs from "node:fs";

const en = JSON.parse(fs.readFileSync("messages/en.json", "utf8"));
const ka = JSON.parse(fs.readFileSync("messages/ka.json", "utf8"));
const ru = JSON.parse(fs.readFileSync("messages/ru.json", "utf8"));

function setByPath(obj, path, value) {
  const parts = path.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const key = parts[i];
    if (!cur[key] || typeof cur[key] !== "object") {
      cur[key] = {};
    }
    cur = cur[key];
  }
  cur[parts[parts.length - 1]] = value;
}

function applyMap(target, entries) {
  for (const [key, value] of Object.entries(entries)) {
    setByPath(target, key, value);
  }
}

const commonKaRu = {
  "product.freeDelivery": {
    ka: "უფასო მიწოდება მთელ საქართველოში",
    ru: "Бесплатная доставка по всей Грузии"
  },
  "product.ratingLabel": {
    ka: "რეიტინგი 4.9 (312)",
    ru: "Рейтинг 4.9 (312)"
  },
  "product.detailsTitle": {
    ka: "პროდუქტის დეტალები",
    ru: "Детали товара"
  },
  "product.detailsText": {
    ka: "დიზაინი შთაგონებულია სკანდინავიური მინიმალიზმით და პრემიუმ კომფორტით.",
    ru: "Дизайн вдохновлен скандинавским минимализмом и премиальным комфортом."
  },
  "product.materialsTitle": {
    ka: "მასალები და მოვლა",
    ru: "Материалы и уход"
  },
  "product.materialsText": {
    ka: "მასიური ხე, გამძლე ტექსტილი და მაღალი ხარისხის ფურნიტურა.",
    ru: "Массив дерева, износостойкий текстиль и качественная фурнитура."
  },
  "product.shippingTitle": {
    ka: "მიწოდება და დაბრუნება",
    ru: "Доставка и возврат"
  },
  "product.shippingText": {
    ka: "მიწოდება 3-7 სამუშაო დღეში. დაბრუნება შესაძლებელია 30 დღეში.",
    ru: "Доставка за 3-7 рабочих дней. Возврат возможен в течение 30 дней."
  },
  "product.qualityNote": {
    ka: "პროდუქცია გადის ხარისხის კონტროლს და მზად არის ყოველდღიური გამოყენებისთვის.",
    ru: "Товары проходят контроль качества и рассчитаны на ежедневное использование."
  },
  "account.name": { ka: "სახელი", ru: "Имя" },
  "account.email": { ka: "ელფოსტა", ru: "Эл. почта" },
  "account.saveProfile": { ka: "პროფილის შენახვა", ru: "Сохранить профиль" },
  "account.saving": { ka: "ინახება...", ru: "Сохранение..." },
  "account.saveFailed": { ka: "შენახვა ვერ მოხერხდა", ru: "Не удалось сохранить" },
  "account.saveFailedMessage": { ka: "პროფილის განახლება ვერ მოხერხდა.", ru: "Не удалось обновить профиль." },
  "account.profileUpdated": { ka: "პროფილი განახლდა", ru: "Профиль обновлен" },
  "account.wallet": { ka: "ბალანსი", ru: "Баланс" },
  "account.addressManagement": { ka: "მისამართების მართვა", ru: "Управление адресами" },
  "account.address": { ka: "მისამართი", ru: "Адрес" },
  "account.city": { ka: "ქალაქი", ru: "Город" },
  "account.zip": { ka: "ZIP კოდი", ru: "Индекс" },
  "account.saveAddress": { ka: "მისამართის შენახვა", ru: "Сохранить адрес" },
  "account.changePassword": { ka: "პაროლის შეცვლა", ru: "Смена пароля" },
  "account.currentPassword": { ka: "მიმდინარე პაროლი", ru: "Текущий пароль" },
  "account.newPassword": { ka: "ახალი პაროლი", ru: "Новый пароль" },
  "account.confirmNewPassword": { ka: "დაადასტურე ახალი პაროლი", ru: "Подтвердите новый пароль" },
  "account.savePassword": { ka: "პაროლის შენახვა", ru: "Сохранить пароль" },
  "account.passwordMismatch": { ka: "პაროლები არ ემთხვევა", ru: "Пароли не совпадают" },
  "account.passwordChangeFailed": { ka: "პაროლის შეცვლა ვერ მოხერხდა", ru: "Не удалось изменить пароль" },
  "account.passwordChanged": { ka: "პაროლი შეიცვალა", ru: "Пароль изменен" },
  "account.wishlist": { ka: "სურვილების სია", ru: "Избранное" },
  "account.orderId": { ka: "შეკვეთის ID", ru: "ID заказа" },
  "account.date": { ka: "თარიღი", ru: "Дата" },
  "account.itemsLabel": { ka: "ნივთები", ru: "Товары" },
  "account.totalLabel": { ka: "ჯამი", ru: "Итого" },
  "account.status": { ka: "სტატუსი", ru: "Статус" },
  "adminProducts.create": { ka: "დამატება", ru: "Создать" },
  "adminProducts.edit": { ka: "რედაქტირება", ru: "Редактировать" },
  "adminProducts.editProduct": { ka: "პროდუქტის რედაქტირება", ru: "Редактирование товара" },
  "adminProducts.deleteProduct": { ka: "პროდუქტის წაშლა", ru: "Удалить товар" },
  "adminProducts.validationFailed": { ka: "ვალიდაცია ვერ გავიდა", ru: "Ошибка валидации" },
  "adminProducts.checkRequired": { ka: "შეამოწმე სავალდებულო ველები.", ru: "Проверьте обязательные поля." },
  "adminProducts.saveFailed": { ka: "შენახვა ვერ მოხერხდა", ru: "Не удалось сохранить" },
  "adminProducts.uploadFailed": { ka: "ატვირთვა ვერ მოხერხდა", ru: "Не удалось загрузить" },
  "adminProducts.tryAnotherImage": { ka: "სცადე სხვა სურათი.", ru: "Попробуйте другое изображение." },
  "adminProducts.imageUploaded": { ka: "სურათი აიტვირთა", ru: "Изображение загружено" },
  "adminProducts.deleteFailed": { ka: "წაშლა ვერ მოხერხდა", ru: "Не удалось удалить" },
  "adminProducts.pleaseTryAgain": { ka: "გთხოვთ სცადოთ თავიდან.", ru: "Пожалуйста, попробуйте снова." },
  "adminProducts.created": { ka: "პროდუქტი დაემატა", ru: "Товар создан" },
  "adminProducts.updated": { ka: "პროდუქტი განახლდა", ru: "Товар обновлен" },
  "adminProducts.deleted": { ka: "პროდუქტი წაიშალა", ru: "Товар удален" },
  "adminProducts.close": { ka: "დახურვა", ru: "Закрыть" },
  "adminProducts.cancel": { ka: "გაუქმება", ru: "Отмена" },
  "adminProducts.save": { ka: "შენახვა", ru: "Сохранить" },
  "adminProducts.saving": { ka: "ინახება...", ru: "Сохранение..." },
  "adminProducts.deleting": { ka: "იშლება...", ru: "Удаление..." },
  "adminProducts.cannotUndo": { ka: "ამ მოქმედების გაუქმება შეუძლებელია.", ru: "Это действие нельзя отменить." },
  "adminProducts.orUploadImage": { ka: "ან ატვირთე სურათი", ru: "Или загрузите изображение" },
  "adminProducts.table.name": { ka: "სახელი", ru: "Название" },
  "adminProducts.table.category": { ka: "კატეგორია", ru: "Категория" },
  "adminProducts.table.price": { ka: "ფასი", ru: "Цена" },
  "adminProducts.table.discount": { ka: "ფასდაკლება", ru: "Скидка" },
  "adminProducts.table.stock": { ka: "მარაგი", ru: "Остаток" },
  "adminProducts.table.actions": { ka: "ქმედებები", ru: "Действия" },
  "adminProducts.fields.name": { ka: "სახელი", ru: "Название" },
  "adminProducts.fields.slug": { ka: "slug", ru: "slug" },
  "adminProducts.fields.description": { ka: "აღწერა", ru: "Описание" },
  "adminProducts.fields.price": { ka: "ფასი", ru: "Цена" },
  "adminProducts.fields.discount": { ka: "ფასდაკლება %", ru: "Скидка %" },
  "adminProducts.fields.stock": { ka: "მარაგი", ru: "Остаток" },
  "adminProducts.fields.imageUrl": { ka: "სურათის URL", ru: "URL изображения" },
  "adminProducts.fields.featured": { ka: "გამორჩეული", ru: "Рекомендуемый" },
  "adminAnalytics.revenue30d": { ka: "შემოსავალი (30 დღე)", ru: "Выручка (30 дней)" },
  "adminAnalytics.orders30d": { ka: "შეკვეთები (30 დღე)", ru: "Заказы (30 дней)" },
  "adminAnalytics.storeStats": { ka: "მაღაზიის სტატისტიკა", ru: "Статистика магазина" },
  "adminAnalytics.users": { ka: "მომხმარებლები", ru: "Пользователи" },
  "adminAnalytics.products": { ka: "პროდუქტები", ru: "Товары" },
  "adminAnalytics.salesOverTime": { ka: "გაყიდვები დროში", ru: "Продажи по времени" },
  "adminAnalytics.last30Days": { ka: "ბოლო 30 დღე", ru: "Последние 30 дней" },
  "adminAnalytics.topProducts": { ka: "ტოპ პროდუქტები", ru: "Топ товары" },
  "adminAnalytics.product": { ka: "პროდუქტი", ru: "Товар" },
  "adminAnalytics.unitsSold": { ka: "გაყიდული ერთეული", ru: "Продано единиц" },
  "aboutPage.kicker": { ka: "ჩვენი ისტორია", ru: "Наша история" },
  "aboutPage.title": { ka: "Furni Enterprise-ის შესახებ", ru: "О Furni Enterprise" },
  "aboutPage.description": {
    ka: "Furni Enterprise ქმნის ავეჯს, რომელიც აერთიანებს ფუნქციურობას, ესთეტიკას და ყოველდღიურ კომფორტს.",
    ru: "Furni Enterprise создает мебель, которая объединяет функциональность, эстетику и ежедневный комфорт."
  },
  "aboutPage.missionTitle": { ka: "ჩვენი მისია", ru: "Наша миссия" },
  "aboutPage.missionDesc": {
    ka: "შევთავაზოთ გამძლე და თანამედროვე ავეჯი, რომელიც თქვენს სივრცეს უფრო პრაქტიკულს გახდის.",
    ru: "Предлагать долговечную и современную мебель, которая делает пространство более практичным."
  },
  "aboutPage.visionTitle": { ka: "ჩვენი ხედვა", ru: "Наше видение" },
  "aboutPage.visionDesc": {
    ka: "გავხდეთ მომხმარებელზე ორიენტირებული ავეჯის ბრენდი რეგიონში.",
    ru: "Стать ориентированным на клиента мебельным брендом в регионе."
  },
  "aboutPage.valuesTitle": { ka: "ჩვენი ღირებულებები", ru: "Наши ценности" },
  "aboutPage.values.quality.title": { ka: "ხარისხიანი მასალები", ru: "Качественные материалы" },
  "aboutPage.values.quality.description": {
    ka: "ვირჩევთ მასალებს, რომლებიც ყოველდღიურ გამოყენებას უძლებს.",
    ru: "Мы выбираем материалы, которые выдерживают ежедневное использование."
  },
  "aboutPage.values.design.title": { ka: "თანამედროვე დიზაინი", ru: "Современный дизайн" },
  "aboutPage.values.design.description": {
    ka: "სკანდინავიური და თანამედროვე ხაზები ერთ balanced სტილში.",
    ru: "Скандинавские и современные линии в сбалансированном стиле."
  },
  "aboutPage.values.service.title": { ka: "სანდო მომსახურება", ru: "Надежный сервис" },
  "aboutPage.values.service.description": {
    ka: "შეკვეთიდან მიწოდებამდე პროცესი გამჭვირვალე და უსაფრთხოა.",
    ru: "От заказа до доставки процесс прозрачен и безопасен."
  },
  "aboutPage.values.living.title": { ka: "მყუდრო სივრცე", ru: "Уютное пространство" },
  "aboutPage.values.living.description": {
    ka: "პროდუქტები, რომლებიც სახლს სითბოსა და სტილს მატებს.",
    ru: "Товары, которые добавляют дому уют и стиль."
  },
  "contactPage.emailLabel": { ka: "ელფოსტა", ru: "Эл. почта" }
};

for (const [path, vals] of Object.entries(commonKaRu)) {
  setByPath(ka, path, vals.ka);
  setByPath(ru, path, vals.ru);
}

const categoryNames = {
  sofas: { ka: "დივნები", ru: "Диваны" },
  armchairs: { ka: "სავარძლები", ru: "Кресла" },
  "coffee-tables": { ka: "ჟურნალის მაგიდები", ru: "Журнальные столики" },
  "dining-tables": { ka: "სასადილო მაგიდები", ru: "Обеденные столы" },
  chairs: { ka: "სკამები", ru: "Стулья" },
  dressers: { ka: "კომოდები", ru: "Комоды" },
  wardrobes: { ka: "გარდერობები", ru: "Шкафы" },
  "office-furniture": { ka: "საოფისე ავეჯი", ru: "Офисная мебель" },
  "tv-stands": { ka: "TV ტუმბოები", ru: "ТВ-тумбы" },
  "decorative-items": { ka: "დეკორი", ru: "Декор" },
  bedroom: { ka: "საძინებელი", ru: "Спальня" }
};

const categoryDescriptions = {
  sofas: {
    ka: "კომფორტზე ორიენტირებული დივნები თანამედროვე მისაღები ოთახისთვის.",
    ru: "Комфортные диваны для современного интерьера гостиной."
  },
  armchairs: {
    ka: "აქცენტური და lounge ტიპის ერგონომიული სავარძლები.",
    ru: "Акцентные и lounge-кресла с эргономичной посадкой."
  },
  "coffee-tables": {
    ka: "ხის, მინისა და ქვის ელემენტებით შექმნილი ჟურნალის მაგიდები.",
    ru: "Журнальные столики из дерева, стекла и камня."
  },
  "dining-tables": {
    ka: "სასადილო მაგიდები ყოველდღიური საოჯახო გამოყენებისთვის.",
    ru: "Обеденные столы для ежедневного использования всей семьей."
  },
  chairs: {
    ka: "მრავალფუნქციური სკამები გამძლე კონსტრუქციით.",
    ru: "Универсальные стулья с прочной конструкцией."
  },
  dressers: {
    ka: "ტევადი კომოდები მოწესრიგებული შენახვისთვის.",
    ru: "Вместительные комоды для аккуратного хранения."
  },
  wardrobes: {
    ka: "გარდერობები ჭკვიანი შიდა განლაგებით.",
    ru: "Шкафы с продуманной внутренней организацией."
  },
  "office-furniture": {
    ka: "საოფისე ავეჯი პროდუქტიული სამუშაო დღისათვის.",
    ru: "Офисная мебель для продуктивного рабочего дня."
  },
  "tv-stands": {
    ka: "მედია ტუმბოები და TV სტენდები კაბელების მართვით.",
    ru: "Медиа-тумбы и ТВ-стойки с удобной организацией кабелей."
  },
  "decorative-items": {
    ka: "სანათები, სარკეები და დეკორი ინტერიერის დასასრულებლად.",
    ru: "Светильники, зеркала и декор для завершения интерьера."
  },
  bedroom: {
    ka: "საძინებლის ავეჯი მშვიდი და ბალანსირებული ესთეტიკით.",
    ru: "Мебель для спальни в спокойной и сбалансированной эстетике."
  }
};

for (const slug of Object.keys(en.catalog.categories || {})) {
  if (categoryNames[slug]) {
    ka.catalog.categories[slug].name = categoryNames[slug].ka;
    ru.catalog.categories[slug].name = categoryNames[slug].ru;
  }
  if (categoryDescriptions[slug]) {
    ka.catalog.categories[slug].description = categoryDescriptions[slug].ka;
    ru.catalog.categories[slug].description = categoryDescriptions[slug].ru;
  }
}

const productCategoryMap = {
  "oslo-modular-sofa": "sofas",
  "nordic-corner-sofa": "sofas",
  "bergen-velvet-sofa": "sofas",
  "stockholm-two-seater": "sofas",
  "arctic-linen-sofa": "sofas",
  "fjord-chaise-sofa": "sofas",

  "helsinki-accent-chair": "armchairs",
  "malmo-lounge-chair": "armchairs",
  "astra-curved-armchair": "armchairs",
  "nord-oak-armchair": "armchairs",
  "aalto-swivel-chair": "armchairs",
  "birka-reading-chair": "armchairs",

  "luno-oak-coffee-table": "coffee-tables",
  "vega-round-coffee-table": "coffee-tables",
  "sirius-marble-top-table": "coffee-tables",
  "linea-minimal-coffee-table": "coffee-tables",
  "norr-glass-coffee-table": "coffee-tables",
  "mira-nesting-coffee-set": "coffee-tables",

  "aalto-dining-table": "dining-tables",
  "skye-extendable-dining-table": "dining-tables",
  "osen-walnut-dining-table": "dining-tables",
  "nordic-oak-family-table": "dining-tables",
  "arden-stone-dining-table": "dining-tables",
  "mila-compact-dining-table": "dining-tables",

  "milo-dining-chair": "chairs",
  "haven-stackable-chair": "chairs",
  "skand-wood-chair": "chairs",
  "linea-upholstered-chair": "chairs",
  "nora-dining-chair": "chairs",
  "vela-curved-chair": "chairs",

  "nord-6-drawer-dresser": "dressers",
  "elm-compact-commode": "dressers",
  "aria-white-dresser": "dressers",
  "sage-oak-commode": "dressers",
  "bruno-wide-dresser": "dressers",
  "mira-bedroom-dresser": "dressers",

  "fjord-sliding-wardrobe": "wardrobes",
  "haven-3-door-wardrobe": "wardrobes",
  "nordic-oak-wardrobe": "wardrobes",
  "linea-mirror-wardrobe": "wardrobes",
  "malm-closet-wardrobe": "wardrobes",
  "skye-compact-wardrobe": "wardrobes",

  "aero-office-desk": "office-furniture",
  "nord-standing-desk": "office-furniture",
  "luna-workstation-desk": "office-furniture",
  "haven-file-cabinet": "office-furniture",
  "focus-office-shelf": "office-furniture",
  "mira-home-office-set": "office-furniture",

  "linea-tv-stand": "tv-stands",
  "nord-walnut-media-unit": "tv-stands",
  "malm-floating-tv-console": "tv-stands",
  "astra-compact-tv-stand": "tv-stands",
  "haven-media-cabinet": "tv-stands",
  "skye-low-tv-unit": "tv-stands",

  "aurora-floor-lamp": "decorative-items",
  "bergen-wall-mirror": "decorative-items",
  "nord-ceramic-vase": "decorative-items",
  "luna-table-lamp": "decorative-items",
  "skye-decorative-tray": "decorative-items",
  "fjord-framed-art-set": "decorative-items",

  "aalto-walnut-bed": "bedroom",
  "skye-upholstered-bed": "bedroom",
  "nordic-queen-bed": "bedroom",
  "mira-storage-bed": "bedroom",
  "bergen-platform-bed": "bedroom",
  "aria-oak-bed-frame": "bedroom"
};

const productDescriptionByCategory = {
  sofas: {
    ka: "პრემიუმ დივანი ყოველდღიური კომფორტისა და ხანგრძლივი გამძლეობისთვის.",
    ru: "Премиальный диван для ежедневного комфорта и длительной эксплуатации."
  },
  armchairs: {
    ka: "ერგონომიული სავარძელი დაბალანსებული მხარდაჭერით და პრემიუმ ქსოვილით.",
    ru: "Эргономичное кресло со сбалансированной поддержкой и премиальной обивкой."
  },
  "coffee-tables": {
    ka: "თანამედროვე ჟურნალის მაგიდა პრაქტიკული გამოყენებით და გამძლე მასალებით.",
    ru: "Современный журнальный столик с практичным функционалом и прочными материалами."
  },
  "dining-tables": {
    ka: "სასადილო მაგიდა საოჯახო ყოველდღიური გამოყენებისთვის.",
    ru: "Обеденный стол для ежедневного семейного использования."
  },
  chairs: {
    ka: "კომფორტული სკამი მყარი ჩარჩოთი და სტაბილური დასაჯდომით.",
    ru: "Комфортный стул с надежным каркасом и устойчивой посадкой."
  },
  dressers: {
    ka: "კომოდი რბილი დახურვის უჯრებით და გამძლე ფასადით.",
    ru: "Комод с плавным закрытием ящиков и прочными фасадами."
  },
  wardrobes: {
    ka: "გარდერობი მოწესრიგებული შიდა განლაგებით ტანსაცმლისა და აქსესუარებისთვის.",
    ru: "Шкаф с продуманной внутренней организацией для одежды и аксессуаров."
  },
  "office-furniture": {
    ka: "საოფისე ავეჯი პროდუქტიული რუტინისა და ყოველდღიური კომფორტისთვის.",
    ru: "Офисная мебель для продуктивной рутины и ежедневного комфорта."
  },
  "tv-stands": {
    ka: "მედია ავეჯი კაბელების ორგანიზაციით და სუფთა სკანდინავიური ესთეტიკით.",
    ru: "Медиа-мебель с организацией кабелей и чистой скандинавской эстетикой."
  },
  "decorative-items": {
    ka: "დეკორის აქსესუარი, რომელიც ინტერიერს სითბოსა და იდენტობას მატებს.",
    ru: "Декоративный аксессуар, который добавляет интерьеру теплоту и характер."
  },
  bedroom: {
    ka: "საძინებლის ავეჯი მშვიდი ვიზუალური ბალანსით და გამძლე კონსტრუქციით.",
    ru: "Мебель для спальни со спокойным визуальным балансом и надежной конструкцией."
  }
};

const replaceRulesKa = [
  ["Modular", "მოდულური"],
  ["Corner", "კუთხის"],
  ["Velvet", "ხავერდოვანი"],
  ["Two-Seater", "ორკაციანი"],
  ["Linen", "ლინენის"],
  ["Chaise", "შეზლონგი"],
  ["Accent", "აქცენტ"],
  ["Lounge", "ლაუნჯ"],
  ["Curved", "მოხრილი"],
  ["Oak", "მუხის"],
  ["Swivel", "მბრუნავი"],
  ["Reading", "საკითხავი"],
  ["Round", "მრგვალი"],
  ["Marble Top", "მარმარილოს ზედაპირით"],
  ["Minimal", "მინიმალისტური"],
  ["Glass", "მინის"],
  ["Nesting", "დასაწყობი"],
  ["Dining", "სასადილო"],
  ["Extendable", "გასაშლელი"],
  ["Walnut", "კაკლის"],
  ["Family", "საოჯახო"],
  ["Stone", "ქვის"],
  ["Compact", "კომპაქტური"],
  ["Stackable", "დასაწყობი"],
  ["Wood", "ხის"],
  ["Upholstered", "რბილგადაკრული"],
  ["6-Drawer", "6-უჯრიანი"],
  ["White", "თეთრი"],
  ["Wide", "ფართო"],
  ["Bedroom", "საძინებლის"],
  ["Sliding", "გასასრიალებელი"],
  ["3-Door", "3-კარიანი"],
  ["Mirror", "სარკიანი"],
  ["Closet", "კარადის"],
  ["Office", "საოფისე"],
  ["Standing", "მაღლადგამართვადი"],
  ["Workstation", "სამუშაო სადგურის"],
  ["File", "ფაილების"],
  ["Home", "სახლის"],
  ["Media", "მედია"],
  ["Floating", "ჩამოკიდებული"],
  ["Low", "დაბალი"],
  ["Floor", "იატაკის"],
  ["Wall", "კედლის"],
  ["Ceramic", "კერამიკული"],
  ["Table", "მაგიდა"],
  ["Decorative", "დეკორატიული"],
  ["Framed", "ჩარჩოიანი"],
  ["Art", "არტ"],
  ["Queen", "ორსაწოლიანი"],
  ["Storage", "სათავსოიანი"],
  ["Platform", "პლატფორმული"],
  ["Frame", "ჩარჩო"],
  ["Sofa", "დივანი"],
  ["Armchair", "სავარძელი"],
  ["Chair", "სკამი"],
  ["Coffee Set", "ყავის მაგიდების ნაკრები"],
  ["Coffee", "ყავის"],
  ["Dresser", "კომოდი"],
  ["Commode", "კომოდი"],
  ["Wardrobe", "გარდერობი"],
  ["Desk", "მაგიდა"],
  ["Cabinet", "კარადა"],
  ["Shelf", "თარო"],
  ["Set", "ნაკრები"],
  ["Stand", "ტუმბო"],
  ["Unit", "ბლოკი"],
  ["Lamp", "სანათი"],
  ["Mirror", "სარკე"],
  ["Vase", "ვაზა"],
  ["Tray", "ლანგარი"],
  ["Bed", "საწოლი"],
  ["TV", "TV"]
];

const replaceRulesRu = [
  ["Modular", "модульный"],
  ["Corner", "угловой"],
  ["Velvet", "велюровый"],
  ["Two-Seater", "двухместный"],
  ["Linen", "льняной"],
  ["Chaise", "шезлонг"],
  ["Accent", "акцентный"],
  ["Lounge", "лаунж"],
  ["Curved", "изогнутый"],
  ["Oak", "дубовый"],
  ["Swivel", "поворотный"],
  ["Reading", "для чтения"],
  ["Round", "круглый"],
  ["Marble Top", "с мраморной столешницей"],
  ["Minimal", "минималистичный"],
  ["Glass", "стеклянный"],
  ["Nesting", "комплект"],
  ["Dining", "обеденный"],
  ["Extendable", "раздвижной"],
  ["Walnut", "ореховый"],
  ["Family", "семейный"],
  ["Stone", "каменный"],
  ["Compact", "компактный"],
  ["Stackable", "штабелируемый"],
  ["Wood", "деревянный"],
  ["Upholstered", "мягкий"],
  ["6-Drawer", "на 6 ящиков"],
  ["White", "белый"],
  ["Wide", "широкий"],
  ["Bedroom", "спальный"],
  ["Sliding", "раздвижной"],
  ["3-Door", "3-дверный"],
  ["Mirror", "зеркальный"],
  ["Closet", "гардеробный"],
  ["Office", "офисный"],
  ["Standing", "регулируемый по высоте"],
  ["Workstation", "рабочая станция"],
  ["File", "файловый"],
  ["Home", "домашний"],
  ["Media", "медиа"],
  ["Floating", "подвесной"],
  ["Low", "низкий"],
  ["Floor", "напольный"],
  ["Wall", "настенный"],
  ["Ceramic", "керамический"],
  ["Table", "стол"],
  ["Decorative", "декоративный"],
  ["Framed", "в раме"],
  ["Art", "арт"],
  ["Queen", "двуспальная"],
  ["Storage", "с местом хранения"],
  ["Platform", "платформенная"],
  ["Frame", "рама"],
  ["Sofa", "диван"],
  ["Armchair", "кресло"],
  ["Chair", "стул"],
  ["Coffee Set", "комплект кофейных столиков"],
  ["Coffee", "кофейный"],
  ["Dresser", "комод"],
  ["Commode", "комод"],
  ["Wardrobe", "шкаф"],
  ["Desk", "стол"],
  ["Cabinet", "шкаф"],
  ["Shelf", "полка"],
  ["Set", "набор"],
  ["Stand", "тумба"],
  ["Unit", "модуль"],
  ["Lamp", "лампа"],
  ["Mirror", "зеркало"],
  ["Vase", "ваза"],
  ["Tray", "поднос"],
  ["Bed", "кровать"],
  ["TV", "TV"]
];

function applyWordReplacements(input, rules) {
  let out = input;
  for (const [from, to] of rules) {
    const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    out = out.replace(new RegExp(`\\b${escaped}\\b`, "g"), to);
  }
  return out.replace(/\s+/g, " ").trim();
}

for (const [slug, item] of Object.entries(en.catalog.products || {})) {
  const category = productCategoryMap[slug];
  if (!category) continue;
  ka.catalog.products[slug].name = applyWordReplacements(item.name, replaceRulesKa);
  ru.catalog.products[slug].name = applyWordReplacements(item.name, replaceRulesRu);
  ka.catalog.products[slug].description = productDescriptionByCategory[category].ka;
  ru.catalog.products[slug].description = productDescriptionByCategory[category].ru;
}

fs.writeFileSync("messages/ka.json", `${JSON.stringify(ka, null, 2)}\n`, "utf8");
fs.writeFileSync("messages/ru.json", `${JSON.stringify(ru, null, 2)}\n`, "utf8");
