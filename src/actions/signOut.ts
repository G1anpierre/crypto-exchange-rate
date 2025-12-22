'use server'

import * as auth from '@/auth'

export async function serverSignOut() {
  await auth.signOut({ redirect: false })
}
