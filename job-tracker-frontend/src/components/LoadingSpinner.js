import "./LoadingSpinner.css";

export default function LoadingSpinner({ label = "Loading..." }) {
  return <div className="loading-state"><div className="loading-spinner" /><span>{label}</span></div>;
}
