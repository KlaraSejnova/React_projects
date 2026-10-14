export default function KineticWord({
  text,
  offset = 0,
}: {
  text: string;
  offset?: number;
}) {
  return (
    <span
      className="block hover:[&>span]:[animation-play-state:paused]"
      aria-hidden
    >
      {text.split("").map((character, index) => (
        <span
          key={index}
          className="inline-block animate-[wave_2s_ease-in-out_infinite]"
          style={{ animationDelay: `${(index + offset) * 0.08}s` }}
        >
          {character}
        </span>
      ))}
    </span>
  );
}
