import { Arg, Ctx, Field, Int, Mutation, ObjectType, Query, Resolver, UseMiddleware } from 'type-graphql'
import { compare, hash } from 'bcryptjs'
import { User } from './entity/User'
import { MyContext } from './MyContext'
import { createAccessToken, createRefershToken } from './auth'
import { isAuth } from './isAuth'
import { sendRefreshToken } from './sendRefreshToken'
import { getConnection } from 'typeorm'
// import { getConnection } from 'typeorm'

@ObjectType()
class LoginResponse {
    @Field()
    accessToken: string
}

@Resolver()
export class UserResolver {

    @Query(() => String)
    hello() {
        return 'hi'
    }

    @Query(() => String)
    @UseMiddleware(isAuth)
    bye(
        @Ctx() { payload }: MyContext
    ) {
        console.log(payload);
        return `your user ID id ${payload?.userId}`
    }

    @Query(() => [User])
    users() {
        return User.find()
    }

    @Mutation(() => Boolean)
    async revokeRefreshTokenForUser(
        @Arg('userId', () => Int) userId: number
    ) {
        await getConnection().getRepository(User).increment({ id: userId }, "tokenVersion", 1)

        return true;
    }

    @Mutation(() => Boolean)
    async register(
        @Arg('email') email: string,
        @Arg('password') password: string
    ) {

        const hashedPassword = await hash(password, 12)
        try {
            await User.insert({
                email,
                password: hashedPassword
            })
        } catch (err) {
            console.log(err);
            return false
        }
        return true
    }

    @Mutation(() => LoginResponse)
    async login(
        @Arg('email') email: string,
        @Arg('password') password: string,
        @Ctx() { res }: MyContext
    ): Promise<LoginResponse> {

        const user = await User.findOne({ where: { email } })

        if (!user) throw new Error('No user found')

        const valid = await compare(password, user.password)

        if (!valid) throw new Error('Bad password')

        //Login success
        sendRefreshToken(res, createRefershToken(user));

        return {
            accessToken: createAccessToken(user)
        }

    }

}