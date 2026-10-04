type Review = { name: string; rating: number; text: string }

const reviews: Review[] = [
  { name: "Ynah", rating: 5, text: "Consistently delicious drinks with balanced flavor and fast service." },
  { name: "Karl C.", rating: 5, text: "Strong coffee that is always made just right." },
  { name: "Brendalie", rating: 5, text: "Friendly baristas and delicious coffee." },
  { name: "Ina Tiongson", rating: 4, text: "Affordable coffee and teas that are easy to enjoy." },
]

function ReviewCard({ review, duplicate = false }: { review: Review; duplicate?: boolean }) {
  return (
    <article className="review-card" aria-hidden={duplicate || undefined}>
      <div className="review-stars" aria-label={`${review.rating} out of 5 stars`}>
        {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
      </div>
      <p>“{review.text}”</p>
      <strong>{review.name}</strong>
    </article>
  )
}

export function ReviewStrip() {
  return (
    <section className="review-strip" aria-labelledby="review-strip-title">
      <div className="review-strip-heading">
        <p className="eyebrow">CUSTOMER LOVE</p>
        <h2 id="review-strip-title">Made for your everyday pickup.</h2>
        <a href="https://pickup-coffee.com/" target="_blank" rel="noopener noreferrer">Read more reviews</a>
      </div>
      <div className="review-strip-window">
        <div className="review-strip-track">
          {reviews.map((review) => <ReviewCard key={review.name} review={review} />)}
          {reviews.map((review) => <ReviewCard key={`duplicate-${review.name}`} review={review} duplicate />)}
        </div>
      </div>
    </section>
  )
}