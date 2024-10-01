'use server'
import * as auth from '@/auth'

export async function signInGithub() {
  return auth.signIn('github', {redirectTo: '/'})
}

export async function signInGoogle() {
  return auth.signIn('google', {redirectTo: '/'})
}
