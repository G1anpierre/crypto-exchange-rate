import GitHub from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'
import Auth0 from 'next-auth/providers/auth0'
import Credentials from 'next-auth/providers/credentials'
import type {NextAuthConfig} from 'next-auth'
import {prismaDB} from './database-prisma'
import bcrypt from 'bcrypt'

export default {
  providers: [
    GitHub,
    Google,
    Auth0({
      clientId: process.env.AUTH_AUTH0_ID,
      clientSecret: process.env.AUTH_AUTH0_SECRET,
      issuer: process.env.AUTH_AUTH0_ISSUER_BASE_URL,
    }),
    Credentials({
      async authorize(credentials) {
        if (!credentials.email || !credentials.password) {
          return null
        }

        const {email, password} = credentials
        const user = await prismaDB.user.findFirst({
          where: {
            email,
          },
        })
        if (!user) {
          return null
        }
        const isValid = await bcrypt.compare(
          String(password),
          String(user.password),
        )
        if (!isValid) {
          return null
        }
        return user
      },
    }),
  ],
  callbacks: {
    async redirect({url, baseUrl}) {
      return url.startsWith(baseUrl)
        ? Promise.resolve(baseUrl)
        : Promise.resolve(baseUrl)
    },
    async session({token, session}) {
      if (token) {
        session.user.name = token.name ?? ''
        session.user.email = token.email ?? ''
        session.user.image = token.picture ?? ''
        session.user.role = String(token.role) ?? ''
      }

      return session
    },
    async jwt({token, user}) {
      const dbUser = await prismaDB.user.findFirst({
        where: {
          email: token.email,
        },
      })

      if (!dbUser) {
        token.id = user!.id
        return token
      }

      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        image: dbUser.image,
        role: dbUser.role,
      }
    },
  },
} satisfies NextAuthConfig
