import WaitingPlayers from "./waiting-players";

export default function WaitingRoom() {
    return (
        <div className="w-full h-full flex justify-center items-center">
        <div className="text-center">
            <h1 className="text-4xl font-bold">Waiting Room</h1>
            <p className="text-lg">Please wait for other players to join...</p>
            <WaitingPlayers />
        </div>
        </div>
    );
}