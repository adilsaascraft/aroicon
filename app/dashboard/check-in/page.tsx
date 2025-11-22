import { redirect } from "next/navigation";

export default function Home() {
  redirect("/dashboard/check-in/airport-arrival");
}
