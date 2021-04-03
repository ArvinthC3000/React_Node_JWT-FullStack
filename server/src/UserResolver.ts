import { Arg, Ctx, Field, Int, Mutation, ObjectType, Query, Resolver, UseMiddleware } from 'type-graphql'
import { compare, hash } from 'bcryptjs'
import { User } from './entity/User'
import { MyContext } from './MyContext'
import { createAccessToken, createRefershToken } from './auth'
import { isAuth } from './isAuth'
import { sendRefreshToken } from './sendRefreshToken'
import { getConnection } from 'typeorm'
import { verify } from 'jsonwebtoken'
// import { getConnection } from 'typeorm'

@ObjectType()
class LoginResponse {
    @Field()
    accessToken: string
    @Field(() => User)
    user: User
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

    @Query(() => User, { nullable: true })
    me(@Ctx() context: MyContext) {
        const authorization = context.req.headers['authorization']

        if (!authorization)
            return null
        try {
            const token = authorization.split(' ')[1]
            const payload: any = verify(token, process.env.ACCESS_TOKEN_SECRET!)
            return User.findOne(payload.userId)
        } catch (err) {
            console.log(err);
            return null
        }
    }

    @Mutation(() => Boolean)
    async logout(@Ctx() { res }: MyContext) {
        sendRefreshToken(res, "")

        return true;
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
            accessToken: createAccessToken(user),
            user
        }

    }

}