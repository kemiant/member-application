import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import Navigation from '@/components/Navigation'
import '@/styles/theme.css'

export default async function FAQPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <>
      <Navigation />
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
        <h1 style={{ color: 'var(--baxa-purple-dark)', marginBottom: '2rem' }}>
          FAQ & Rating Guidelines
        </h1>

        {/* How to Use This System */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--baxa-purple)', marginTop: 0 }}>
            📖 How to Use This System
          </h2>
          <div style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
            <ol style={{ paddingLeft: '1.5rem' }}>
              <li><strong>Navigate:</strong> Use the tabs at the top to switch between Applications, Summary, and FAQ</li>
              <li><strong>Review Applications:</strong> Read through applicant essays, resumes, and information</li>
              <li><strong>Rate:</strong> Assign a rating from 1-5 based on the criteria below</li>
              <li><strong>Comment:</strong> Add optional comments explaining your rating</li>
              <li><strong>Submit:</strong> Click "Submit Rating" to save your evaluation</li>
              <li><strong>Track Progress:</strong> View summary statistics and top-rated applicants in the Summary tab</li>
            </ol>
            <p><strong>Tip:</strong> Use the "Reveal" button to see applicant names, or keep them hidden for unbiased review</p>
          </div>
        </div>

        {/* Rating Criteria */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--baxa-purple)', marginTop: 0 }}>
            ⭐ Rating Criteria
          </h2>
          <div style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
            <p>When evaluating applicants, focus on these two key areas:</p>
            
            <div style={{ marginTop: '1.5rem' }}>
              <h3 style={{ color: 'var(--baxa-purple-dark)', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                1. Attitude (50%)
              </h3>
              <ul style={{ paddingLeft: '1.5rem' }}>
                <li>Enthusiasm for BAXA and business analytics</li>
                <li>Positive mindset and willingness to learn</li>
                <li>Collaborative spirit and team-oriented thinking</li>
                <li>Cultural fit with BAXA values</li>
                <li>Genuine interest in contributing to the organization</li>
              </ul>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <h3 style={{ color: 'var(--baxa-purple-dark)', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                2. Commitment (50%)
              </h3>
              <ul style={{ paddingLeft: '1.5rem' }}>
                <li>Demonstrated dedication (info session attendance, application quality)</li>
                <li>Time availability and realistic schedule management</li>
                <li>Long-term interest in staying involved</li>
                <li>Past follow-through on commitments (if returning member)</li>
                <li>Ability to prioritize BAXA activities alongside other obligations</li>
              </ul>
            </div>

            <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'var(--baxa-purple-bg)', borderRadius: '0.375rem' }}>
              <h3 style={{ color: 'var(--baxa-purple-dark)', fontSize: '1rem', marginTop: 0, marginBottom: '0.5rem' }}>
                Rating Scale:
              </h3>
              <ul style={{ paddingLeft: '1.5rem', marginBottom: 0 }}>
                <li><strong>5 - Exceptional:</strong> Outstanding attitude and commitment, perfect fit</li>
                <li><strong>4 - Strong:</strong> Very positive on both criteria, would be a great addition</li>
                <li><strong>3 - Good:</strong> Solid candidate with room for growth</li>
                <li><strong>2 - Needs Improvement:</strong> Concerns about attitude or commitment level</li>
                <li><strong>1 - Not Recommended:</strong> Significant concerns, not a good fit at this time</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Frequently Asked Questions */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--baxa-purple)', marginTop: 0 }}>
            ❓ Frequently Asked Questions
          </h2>
          <div style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ color: 'var(--baxa-purple-dark)', fontSize: '1rem' }}>
                Q: How many applicants should I rate?
              </h3>
              <p style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
                A: Review as many as you can! Use the filter options to focus on specific groups or your assigned rows.
              </p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ color: 'var(--baxa-purple-dark)', fontSize: '1rem' }}>
                Q: Can I change my rating after submitting?
              </h3>
              <p style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
                A: Yes! Simply submit a new rating for the same applicant, and it will update your previous rating.
              </p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ color: 'var(--baxa-purple-dark)', fontSize: '1rem' }}>
                Q: What does "NOT CONSIDERED" mean?
              </h3>
              <p style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
                A: Applicants who attended 0 info sessions are marked "NOT CONSIDERED" and shown with reduced opacity. They show less commitment to BAXA.
              </p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ color: 'var(--baxa-purple-dark)', fontSize: '1rem' }}>
                Q: Should I rate returning applicants differently?
              </h3>
              <p style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
                A: Returning members and those who applied before should still be evaluated on attitude and commitment, but consider their past involvement and growth.
              </p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ color: 'var(--baxa-purple-dark)', fontSize: '1rem' }}>
                Q: What filters are available?
              </h3>
              <p style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
                A: You can filter by McCombs/Non-McCombs, year, returning status, assigned rows, and search by text in essays.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--baxa-purple)', marginTop: 0 }}>
            📞 Need Help?
          </h2>
          <div style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
            <p>If you encounter any issues or have questions:</p>
            <ul style={{ paddingLeft: '1.5rem' }}>
              <li><strong>Technical Issues:</strong> Hello! If you run into any issues contact me (Cammi Tran cammi.tran@outlook.com) for any questions.</li>
              <li><strong>Rating Questions:</strong> Contact Cammi Tran or the Executives for technical or rating questions.</li>
              <li><strong>Application Concerns:</strong> Contact the main directors or the executives for any questions regarding the applicants.</li>
            </ul>
            <p style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--baxa-purple-bg)', borderRadius: '0.375rem', marginBottom: 0 }}>
              <strong>Note:</strong> All ratings are confidential and only visible to authorized BAXA leadership.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
