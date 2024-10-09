'use server'
import * as auth from '@/auth'

export async function signInGithub() {
  return auth.signIn('github', {redirectTo: '/'})
}

export async function signInGoogle() {
  return auth.signIn('google', {redirectTo: '/'})
}

export async function signInAuth0() {
  return auth.signIn('auth0', {redirectTo: '/'})
}

export async function signIn(provider: string, options: {redirectTo: string}) {
  return auth.signIn(provider, options)
}
