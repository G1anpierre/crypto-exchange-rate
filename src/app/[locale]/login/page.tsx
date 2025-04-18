'use client'

import React from 'react'
import {Button, Input, Checkbox, Link, Divider} from "@heroui/react"
import {Icon} from '@iconify/react'
import {signInAuth0, signInGithub, signInGoogle} from '@/actions/signIn'
import {Form, FormControl, FormField, FormItem} from '@/components/ui/form'
import {z} from 'zod'
import {zodResolver} from '@hookform/resolvers/zod'
import {useForm} from 'react-hook-form'
import {signIn} from 'next-auth/react'
import {toast} from '@/hooks/use-toast'

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export default function LoginPage() {
  const [isVisible, setIsVisible] = React.useState(false)

  const toggleVisibility = () => setIsVisible(!isVisible)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const result = await signIn('credentials', {
      email: values.email,
      password: values.password,
    })
    if (result?.error) {
      toast({
        title: 'Sign In Failed',
        description: result.error,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Sign In Successfully',
        description: 'You have been logged in',
        variant: 'default',
      })
    }
  }

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-large">
        <div className="flex flex-col items-center pb-6">
          <div className="h-5 w-60 bg-logo-light bg-cover object-cover dark:bg-logo-dark"></div>
          <div className="my-5 text-center">
            <p className="text-xl font-medium ">Welcome Back</p>
            <p className="text-small text-default-500">
              Log in to your account to continue
            </p>
          </div>
        </div>
        <Form {...form}>
          <form
            className="flex flex-col gap-3"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div className="flex flex-col">
              <FormField
                control={form.control}
                name="email"
                render={({field}) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        classNames={{
                          base: '-mb-[2px]',
                          inputWrapper:
                            'rounded-b-none data-[hover=true]:z-10 group-data-[focus-visible=true]:z-10',
                        }}
                        label="Email Address"
                        placeholder="Enter your email"
                        type="email"
                        variant="bordered"
                        isInvalid={!!form.formState.errors.email}
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({field}) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        classNames={{
                          inputWrapper: 'rounded-t-none',
                        }}
                        endContent={
                          <button type="button" onClick={toggleVisibility}>
                            {isVisible ? (
                              <Icon
                                className="pointer-events-none text-2xl text-default-400"
                                icon="solar:eye-closed-linear"
                              />
                            ) : (
                              <Icon
                                className="pointer-events-none text-2xl text-default-400"
                                icon="solar:eye-bold"
                              />
                            )}
                          </button>
                        }
                        label="Password"
                        placeholder="Enter your password"
                        type={isVisible ? 'text' : 'password'}
                        variant="bordered"
                        isInvalid={!!form.formState.errors.password}
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="flex items-center justify-between px-1 py-2">
              <Checkbox name="remember" size="sm">
                Remember me
              </Checkbox>
              <Link className="text-default-500" href="#" size="sm">
                Forgot password?
              </Link>
            </div>
            <Button color="primary" type="submit">
              Log In
            </Button>
          </form>
        </Form>

        <div className="flex items-center gap-4 py-2">
          <Divider className="flex-1" />
          <p className="shrink-0 text-tiny text-default-500">OR</p>
          <Divider className="flex-1" />
        </div>
        <div className="flex flex-col gap-2">
          <form action={signInGoogle}>
            <Button
              startContent={<Icon icon="flat-color-icons:google" width={24} />}
              variant="bordered"
              fullWidth
              type="submit"
            >
              Continue with Google
            </Button>
          </form>
          <form action={signInGithub}>
            <Button
              startContent={
                <Icon
                  className="text-default-500"
                  icon="fe:github"
                  width={24}
                />
              }
              fullWidth
              variant="bordered"
              type="submit"
            >
              Continue with Github
            </Button>
          </form>
          <form action={signInAuth0}>
            <Button
              startContent={
                <Icon
                  className="text-default-500"
                  icon="cib:auth0"
                  width={24}
                />
              }
              fullWidth
              variant="bordered"
              type="submit"
            >
              Continue with Auth0
            </Button>
          </form>
        </div>
        <p className="text-center text-small">
          Need to create an account?&nbsp;
          <Link href="/signup" size="sm">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
}
