type RewardModalProps = {
  userName: string;
  progress: number;
  onDismiss: () => void;
};

export default function RewardModal({
  userName,
  progress,
  onDismiss,
}: RewardModalProps) {
  return (
    <div className="reward-modal-backdrop">
      <section
        className="reward-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reward-modal-title"
      >
        <span className="reward-modal-star" aria-hidden="true">
          ★
        </span>
        <p className="eyebrow">Malá odměna</p>
        <h2 id="reward-modal-title">Skvělá práce, {userName}!</h2>
        <p>Máš hotovo {progress} %. Běž si říct o odměnu, zasloužíš si ji!</p>
        <button
          type="button"
          className="reward-modal-button"
          onClick={onDismiss}
        >
          Super, děkuju!
        </button>
      </section>
    </div>
  );
}
