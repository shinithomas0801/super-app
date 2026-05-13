import type { ReactNode } from "react";
import { EducationAccessError } from "@/domain/education";
import { EducationAccessNotice } from "./EducationAccessNotice";

type Props<T> = {
  loader: () => Promise<T>;
  render: (data: T) => ReactNode;
};

export async function EducationSafePage<T>({ loader, render }: Props<T>) {
  try {
    const data = await loader();
    return render(data);
  } catch (error) {
    if (error instanceof EducationAccessError) {
      return <EducationAccessNotice message={error.message} />;
    }
    throw error;
  }
}
