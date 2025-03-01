export default function TranscriptDisplay({ label, text }) {
    return (
      <div className="my-3 p-2 border rounded bg-gray-50">
        <p className="text-sm font-semibold mb-1">{label} Text:</p>
        <p className="text-gray-700 whitespace-pre-wrap">{text}</p>
      </div>
    )
  }
  