/** Вставка Schema.org JSON-LD. Данные приходят из lib/seo.ts. */
export function JsonLd({ data, id }: { data: unknown; id: string }) {
  return (
    <script
      id={id}
      type="application/ld+json"
      // JSON.stringify безопасен: мы контролируем содержимое, а не пользовательский ввод
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
