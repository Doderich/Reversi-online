import Link from "next/link";
import { UserInput } from "./user-input";

export default function Home() {
  return (
    <main className="flex flex-col h-full w-full items-center justify-evenly gap-10 p-24">
      <span className=" text-5xl font-bold">Reversi</span>
      <div className="flex flex-1">
        <UserInput />
      </div>
    </main>
  );
}
