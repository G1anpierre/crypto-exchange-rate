'use server'
import bcrypt from 'bcrypt'
import {unstable_noStore as noStore} from 'next/cache'
import {prismaDB} from '@/database-prisma'

const getSingleUser = async (email: string) => {
  noStore()
  try {
    const user = await prismaDB.user.findUnique({
      where: {
        email,
      },
    })
    return {
      user,
      success: true,
    }
  } catch (error) {
    return {
      message: 'Error getting user',
      success: false,
    }
  }
}

export const signUpAction = async ({
  username,
  email,
  password,
}: {
  username: string
  email: string
  password: string
}) => {
  const respond = await getSingleUser(email)
  if (respond.user && respond.success) {
    return {
      message: 'User already exists',
      success: false,
    }
  }
  const hashedPassword = await bcrypt.hash(password, 10)
  try {
    const createdUser = await prismaDB.user.create({
      data: {
        name: username,
        email,
        password: hashedPassword,
      },
    })
    return {
      message: `User ${createdUser.name} created successfully`,
      success: true,
    }
  } catch (error) {
    return {
      message: 'Error creating user',
      success: false,
    }
  }
}
