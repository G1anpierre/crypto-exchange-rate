import GitHub from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import type {NextAuthConfig} from 'next-auth'
import {prismaDB} from './database-prisma'
import bcrypt from 'bcrypt'

export default {
  providers: [
    GitHub,
    Google,
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
  },
} satisfies NextAuthConfig
