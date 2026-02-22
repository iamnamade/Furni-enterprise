import { redirect } from "next/navigation";

type QueryValue = string | string[] | undefined;

type Props = {
  params: { locale: string };
  searchParams: {
    search?: QueryValue;
    query?: QueryValue;
    q?: QueryValue;
  };
};

function firstValue(value: QueryValue) {
  if (Array.isArray(value)) {
    return value[0] || "";
  }

  return value || "";
}

function normalizeSearch(value: QueryValue) {
  const normalizedWhitespace = firstValue(value).replace(/\s+/g, " ").trim();
  return normalizedWhitespace.slice(0, 120);
}

export default function SearchRedirectPage({ params, searchParams }: Props) {
  const search = normalizeSearch(searchParams.search ?? searchParams.query ?? searchParams.q);

  if (!search) {
    redirect(`/${params.locale}/shop`);
  }

  const queryParams = new URLSearchParams({ search });
  redirect(`/${params.locale}/shop?${queryParams.toString()}`);
}
