import NextAuth, {DefaultSession} from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      email: string
      image: string
      role: string
    } & DefaultSession['user']
  }
}
