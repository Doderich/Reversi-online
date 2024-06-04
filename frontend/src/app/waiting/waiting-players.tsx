"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function WaitingPlayers({ url }: { url: string }) {
  //@ts-ignore
  const [waitingPlayers, setWaitingPlayers] = useState<
    { id: string; username: string }[]
  >([]);
  const [openMatchFoundDialog, setOpenMatchFoundDialog] = useState(false);
  const [game, setGame] = useState({ game_id: "" });
  const [socketId, setSocketId] = useState("");
  const router = useRouter();

  useEffect(() => {
    const socket = io(url, {
      path: "/live/reversi-server/",
    });
    if (!localStorage.getItem("username")) {
      router.push("/");
    }
    socket.emit("waiting", { username: localStorage.getItem("username") });

    setSocketId(socket.id);
    // Listen for incoming messages
    socket.on(
      "waiting players",
      ({
        waitingPlayers,
      }: {
        waitingPlayers: { id: string; username: string }[];
      }) => {
        // Add type annotation for waitingPlayers parameter
        console.log(waitingPlayers);
        setWaitingPlayers(waitingPlayers);
      },
    );

    socket.on("match found", ({ game_id }: { game_id: string }) => {
      console.log("Match found", game_id);
      setOpenMatchFoundDialog(true);
      setGame({ game_id });
    });
  }, []);

  return (
    <div>
      <Dialog
        open={openMatchFoundDialog}
        onOpenChange={setOpenMatchFoundDialog}
      >
        <DialogContent>
          <p>Match Found</p>
          <p>Game ID: {game.game_id}</p>
          <Button onClick={() => router.push(`/game/${game.game_id}`)}>
            Go to Game
          </Button>
        </DialogContent>
      </Dialog>
      <div>
        {waitingPlayers.map((player, index) => (
          <div key={player.id} className="flex gap-2 justify-center">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <span className={player.id === socketId ? "font-bold" : ""}>
              {player.username}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
