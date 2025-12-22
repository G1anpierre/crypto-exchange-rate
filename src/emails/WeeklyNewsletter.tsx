import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface Article {
  title: string
  url: string
  description: string | null
  imageUrl: string | null
  source: string
  publishedAt: Date
}

interface WeeklyNewsletterProps {
  articles: Article[]
  unsubscribeUrl: string
  userName?: string
}

export default function WeeklyNewsletter({
  articles,
  unsubscribeUrl,
  userName,
}: WeeklyNewsletterProps) {
  const previewText = `Top 5 Crypto News This Week`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>Weekly Crypto Newsletter</Heading>
            <Text style={greeting}>
              {userName ? `Hi ${userName},` : 'Hi there,'}
            </Text>
            <Text style={paragraph}>
              Here are the top 5 most valuable crypto news stories from this
              week. Stay informed and ahead of the curve!
            </Text>
          </Section>

          <Hr style={hr} />

          {articles.map((article, index) => (
            <Section key={article.url} style={articleSection}>
              <Text style={articleNumber}>#{index + 1}</Text>

              {article.imageUrl && (
                <Img
                  src={article.imageUrl}
                  alt={article.title}
                  style={articleImage}
                />
              )}

              <Heading as="h2" style={articleTitle}>
                {article.title}
              </Heading>

              <Text style={articleSource}>Source: {article.source}</Text>

              {article.description && (
                <Text style={articleDescription}>{article.description}</Text>
              )}

              <Button href={article.url} style={button}>
                Read Full Article →
              </Button>

              {index < articles.length - 1 && <Hr style={articleDivider} />}
            </Section>
          ))}

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>
              You are receiving this email because you subscribed to our weekly
              crypto newsletter.
            </Text>
            <Text style={footerText}>
              If you no longer wish to receive these emails, you can{' '}
              <Link href={unsubscribeUrl} style={link}>
                unsubscribe here
              </Link>
              .
            </Text>
            <Text style={copyright}>
              © {new Date().getFullYear()} Crypto Exchange. All rights
              reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
}

const header = {
  padding: '32px 32px 0',
}

const h1 = {
  color: '#1a1a1a',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0 0 16px',
  textAlign: 'center' as const,
}

const greeting = {
  color: '#1a1a1a',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0 8px',
}

const paragraph = {
  color: '#525252',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 16px',
}

const hr = {
  borderColor: '#e6ebf1',
  margin: '32px 0',
}

const articleSection = {
  padding: '0 32px',
  marginBottom: '24px',
}

const articleNumber = {
  color: '#667eea',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 8px',
}

const articleImage = {
  width: '100%',
  height: 'auto',
  borderRadius: '8px',
  marginBottom: '16px',
  objectFit: 'cover' as const,
  maxHeight: '300px',
}

const articleTitle = {
  color: '#1a1a1a',
  fontSize: '20px',
  fontWeight: 'bold',
  lineHeight: '28px',
  margin: '0 0 8px',
}

const articleSource = {
  color: '#667eea',
  fontSize: '12px',
  fontWeight: '600',
  margin: '0 0 12px',
  textTransform: 'uppercase' as const,
}

const articleDescription = {
  color: '#525252',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 16px',
}

const button = {
  backgroundColor: '#667eea',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
  margin: '8px 0',
}

const articleDivider = {
  borderColor: '#f0f0f0',
  margin: '32px 0',
}

const footer = {
  padding: '0 32px',
}

const footerText = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '0 0 8px',
  textAlign: 'center' as const,
}

const link = {
  color: '#667eea',
  textDecoration: 'underline',
}

const copyright = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '16px 0 0',
  textAlign: 'center' as const,
}
