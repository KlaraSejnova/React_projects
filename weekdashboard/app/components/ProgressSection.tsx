type ProgressSectionProps = {
  progress: number;
  error: string;
};

export default function ProgressSection({
  progress,
  error,
}: ProgressSectionProps) {
  return (
    <section className="progress-section" aria-label="Týdenní postup">
      <div className="progress-copy">
        <span>Týdenní postup</span>
        <strong>{progress} %</strong>
      </div>
      <div className="progress-track" aria-hidden="true">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
      {error && (
        <p className="progress-error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
