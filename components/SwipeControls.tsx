interface Props {
  onLike: () => void
  onPass: () => void
  disabled?: boolean
}

export default function SwipeControls({ onLike, onPass, disabled }: Props) {
  return (
    <div className="flex gap-4 justify-center">
      <button
        onClick={onPass}
        disabled={disabled}
        className="flex-1 flex items-center justify-center gap-2 bg-[#141414] hover:bg-[#1e1e1e] disabled:opacity-50 border border-[#2a2a2a] text-[#f5f5f5] font-semibold py-4 rounded-2xl transition-colors text-lg"
        aria-label="Pass"
      >
        👎 Pass
      </button>
      <button
        onClick={onLike}
        disabled={disabled}
        className="flex-1 flex items-center justify-center gap-2 bg-[#e63462] hover:bg-[#c4284f] disabled:opacity-50 text-white font-semibold py-4 rounded-2xl transition-colors text-lg"
        aria-label="Like"
      >
        👍 Like
      </button>
    </div>
  )
}
