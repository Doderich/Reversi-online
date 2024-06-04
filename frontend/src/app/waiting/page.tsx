import WaitingPlayers from "./waiting-players";

export default function WaitingRoom() {
  const url =
    //process.env.NEXT_PUBLIC_WEBSOCKET_URL ||
    "https://malte-budig.de";
  return (
    <div className="w-full h-full flex justify-center items-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Waiting Room</h1>
        <p className="text-lg">Please wait for other players to join...</p>
        <WaitingPlayers url={url} />
      </div>
    </div>
  );
}
