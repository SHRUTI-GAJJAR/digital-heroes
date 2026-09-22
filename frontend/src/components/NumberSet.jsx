export default function NumberSet({ numbers, className = "winning-numbers", label = "Winning numbers" }) {
  if (!Array.isArray(numbers) || !numbers.length) return null;
  return <div className={className} aria-label={`${label}: ${numbers.join(", ")}`}>{numbers.map((number, index) => <span key={`${number}-${index}`}>{number}</span>)}</div>;
}
