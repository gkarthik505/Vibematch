interface Props {
  topics: string[]
}

export default function TopicChips({ topics }: Props) {
  if (!topics || topics.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1.5">
      {topics.map(topic => (
        <span
          key={topic}
          className="text-xs bg-[#1e1e1e] border border-[#2a2a2a] rounded-full px-2.5 py-1 text-[#aaa]"
        >
          {topic}
        </span>
      ))}
    </div>
  )
}
