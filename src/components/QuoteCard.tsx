type QuoteCardProps = {
  quote: string
  onNewQuote: () => void
}

const QuoteCard = ({ quote, onNewQuote }: QuoteCardProps) => (
  <div className="card quote-card">
    <p className="quote-text">“{quote}”</p>
    <button type="button" className="ghost" onClick={onNewQuote}>
      New quote
    </button>
  </div>
)

export default QuoteCard
