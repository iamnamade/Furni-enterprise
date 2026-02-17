import { Compass, Gem, Leaf, ShieldCheck } from "lucide-react";

const copy = {
  en: {
    kicker: "About",
    title: "About Furni Enterprise",
    description:
      "Furni Enterprise began with a simple goal: make premium, design-forward furniture practical for everyday homes and studios.",
    missionTitle: "Our Mission",
    missionDesc: "Deliver reliable, modern furniture that balances aesthetic clarity with real-world comfort and durability.",
    visionTitle: "Our Vision",
    visionDesc: "Become the most trusted destination for intentional interiors through design, fair value, and consistent service.",
    valuesTitle: "Core Values",
    values: {
      quality: { title: "Crafted Quality", description: "Every piece is selected for durability, material integrity, and long-term use." },
      design: { title: "Responsible Design", description: "We prioritize mindful sourcing and timeless design over short-lived trends." },
      service: { title: "Trusted Service", description: "Transparent support, secure checkout, and dependable delivery are our baseline." },
      living: { title: "Intentional Living", description: "Our collections help create calm, practical interiors that feel thoughtfully curated." }
    }
  },
  ka: {
    kicker: "ჩვენ შესახებ",
    title: "ჩვენ შესახებ",
    description: "Furni Enterprise-ის მიზანია პრემიუმ ავეჯი ყოველდღიურ ცხოვრებაში უფრო პრაქტიკული გახადოს.",
    missionTitle: "ჩვენი მისია",
    missionDesc: "საიმედო და თანამედროვე ავეჯის მიწოდება, რომელიც ესთეტიკასა და კომფორტს აბალანსებს.",
    visionTitle: "ჩვენი ხედვა",
    visionDesc: "ვიყოთ ინტერიერის ყველაზე სანდო მიმართულება ხარისხით, ღირებულებით და სერვისით.",
    valuesTitle: "ძირითადი ღირებულებები",
    values: {
      quality: { title: "ხარისხი", description: "თითოეული პროდუქტი შერჩეულია გამძლეობასა და მასალის სანდოობაზე." },
      design: { title: "პასუხისმგებლიანი დიზაინი", description: "ვარჩევთ მდგრად და დროში გამძლე დიზაინს." },
      service: { title: "სანდო სერვისი", description: "გამჭვირვალე მხარდაჭერა, უსაფრთხო გადახდა და სტაბილური მიწოდება." },
      living: { title: "გააზრებული ცხოვრება", description: "ჩვენი კოლექციები ქმნის მშვიდ და პრაქტიკულ სივრცეებს." }
    }
  },
  ru: {
    kicker: "О нас",
    title: "О Furni Enterprise",
    description: "Furni Enterprise делает премиальную дизайнерскую мебель практичной для повседневной жизни.",
    missionTitle: "Наша миссия",
    missionDesc: "Предлагать надежную современную мебель с балансом эстетики, комфорта и долговечности.",
    visionTitle: "Наше видение",
    visionDesc: "Стать самым надежным направлением для продуманных интерьеров.",
    valuesTitle: "Ценности",
    values: {
      quality: { title: "Качество", description: "Каждая позиция отбирается по долговечности и качеству материалов." },
      design: { title: "Ответственный дизайн", description: "Ставим в приоритет устойчивый и вневременной дизайн." },
      service: { title: "Надежный сервис", description: "Прозрачная поддержка, безопасная оплата и стабильная доставка." },
      living: { title: "Осознанный интерьер", description: "Наши коллекции помогают создавать спокойные и функциональные пространства." }
    }
  }
} as const;

export default async function AboutPage({ params }: { params: { locale: string } }) {
  const t = copy[(params.locale as "en" | "ka" | "ru") || "en"] || copy.en;
  const values = [
    {
      icon: Gem,
      title: t.values.quality.title,
      description: t.values.quality.description
    },
    {
      icon: Leaf,
      title: t.values.design.title,
      description: t.values.design.description
    },
    {
      icon: ShieldCheck,
      title: t.values.service.title,
      description: t.values.service.description
    },
    {
      icon: Compass,
      title: t.values.living.title,
      description: t.values.living.description
    }
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-12">
      <section className="glass-panel space-y-5 p-8 sm:p-10">
        <p className="text-xs uppercase tracking-[0.22em] text-muted">{t.kicker}</p>
        <h1 className="text-4xl font-bold tracking-[-0.03em] text-[color:var(--foreground)] sm:text-5xl">{t.title}</h1>
        <p className="max-w-3xl text-base font-medium text-[color:var(--muted)]">
          {t.description}
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <article className="glass-panel p-7">
          <h2 className="text-2xl font-semibold tracking-[-0.02em]">{t.missionTitle}</h2>
          <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">{t.missionDesc}</p>
        </article>
        <article className="glass-panel p-7">
          <h2 className="text-2xl font-semibold tracking-[-0.02em]">{t.visionTitle}</h2>
          <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">{t.visionDesc}</p>
        </article>
      </section>

      <section className="space-y-5">
        <h2 className="section-title">{t.valuesTitle}</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          {values.map(({ icon: Icon, title, description }) => (
            <article key={title} className="surface-card p-6">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[color:var(--control-border)] bg-[color:var(--control-bg)] text-[color:var(--accent)]">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-[color:var(--muted)]">{description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
