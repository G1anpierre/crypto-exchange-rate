'use client'

import React from 'react'
import {Button, Input, Link, Divider} from '@heroui/react'
import {Icon} from '@iconify/react'
import {signInGithub, signInGoogle} from '@/actions/signIn'
import {useMutation} from '@tanstack/react-query'
import {CircularProgress} from '@heroui/react'
import {useToast} from '@/hooks/use-toast'

import {Form, FormControl, FormField, FormItem} from '@/components/ui/form'
import {z} from 'zod'
import {zodResolver} from '@hookform/resolvers/zod'
import {useForm} from 'react-hook-form'
import {signUpAction} from '@/actions/signUp'
import {useRouter} from 'next/navigation'

const formSchema = z
  .object({
    username: z.string().min(2).max(50),
    email: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'], // Set the path of the error to confirmPassword
  })

export default function SignUpPage() {
  const [isVisible, setIsVisible] = React.useState(false)
  const [isConfirmVisible, setIsConfirmVisible] = React.useState(false)
  const {toast} = useToast()
  const router = useRouter()
  const toggleVisibility = () => setIsVisible(!isVisible)
  const toggleConfirmVisibility = () => setIsConfirmVisible(!isConfirmVisible)

  const mutation = useMutation({
    mutationFn: signUpAction,
    onSuccess: data => {
      if (data.success) {
        toast({
          title: 'Sign Up Successfully',
          description: data.message,
          variant: 'default',
        })
        router.push('/login')
      } else {
        toast({
          title: 'Sign Up Failed',
          description: data.message,
          variant: 'destructive',
        })
      }
    },
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    mutation.mutate(values)
  }

  const {errors} = form.formState

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-large">
        <div className="flex flex-col items-center pb-6">
          <div className="h-5 w-60 bg-logo-light bg-cover object-cover dark:bg-logo-dark"></div>
          <p className="text-small text-default-500">
            Create an account to get started
          </p>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col"
          >
            <FormField
              control={form.control}
              name="username"
              render={({field}) => (
                <FormItem>
                  <FormControl>
                    <Input
                      isRequired
                      classNames={{
                        base: '-mb-[2px]',
                        inputWrapper:
                          'rounded-b-none data-[hover=true]:z-10 group-data-[focus-visible=true]:z-10',
                      }}
                      label="Username"
                      placeholder="Enter your username"
                      type="text"
                      variant="bordered"
                      errorMessage={errors.username?.message}
                      validationBehavior="aria"
                      isInvalid={!!errors.username}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({field}) => (
                <FormItem>
                  <FormControl>
                    <Input
                      isRequired
                      classNames={{
                        base: '-mb-[2px]',
                        inputWrapper:
                          'rounded-none data-[hover=true]:z-10 group-data-[focus-visible=true]:z-10',
                      }}
                      label="Email Address"
                      placeholder="Enter your email"
                      type="email"
                      variant="bordered"
                      errorMessage={errors.email?.message}
                      isInvalid={!!errors.email}
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
                      isRequired
                      classNames={{
                        base: '-mb-[2px]',
                        inputWrapper:
                          'rounded-none data-[hover=true]:z-10 group-data-[focus-visible=true]:z-10',
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
                      errorMessage={errors.password?.message}
                      isInvalid={!!errors.password}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({field}) => (
                <FormItem>
                  <FormControl>
                    <Input
                      isRequired
                      classNames={{
                        inputWrapper: 'rounded-t-none',
                      }}
                      endContent={
                        <button type="button" onClick={toggleConfirmVisibility}>
                          {isConfirmVisible ? (
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
                      label="Confirm Password"
                      placeholder="Confirm your password"
                      type={isConfirmVisible ? 'text' : 'password'}
                      variant="bordered"
                      errorMessage={errors.confirmPassword?.message}
                      isInvalid={!!errors.confirmPassword}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button color="primary" type="submit" className="mt-4">
              Submit{' '}
              {mutation.isPending && (
                <CircularProgress size="sm" aria-label="Loading..." />
              )}
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
              Sign Up with Google
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
              variant="bordered"
              fullWidth
              type="submit"
            >
              Sign Up with Github
            </Button>
          </form>
        </div>
        <p className="text-center text-small">
          Already have an account?&nbsp;
          <Link href="/login" size="sm">
            Log In
          </Link>
        </p>
      </div>
    </div>
  )
}
