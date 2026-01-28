import { Star } from "lucide-react"

export function StarRating({ value = 0, onChange, max = 10, readonly = false }) {
    const stars = Array.from({ length: max }, (_, i) => i + 1)

    return (
        <div className="flex gap-1 flex-wrap">
            {stars.map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => !readonly && onChange && onChange(star)}
                    className={`focus:outline-none transition-transform hover:scale-110 ${readonly ? 'cursor-default' : 'cursor-pointer'}`}
                    disabled={readonly}
                >
                    <Star
                        size={20}
                        className={`${star <= value ? "fill-emerald text-emerald" : "text-gray-300 fill-gray-100"}`}
                    />
                </button>
            ))}
            <span className="ml-2 text-sm text-gray-500 font-medium">{value}/{max}</span>
        </div>
    )
}
