import {
    getServerSession,
    type DefaultSession,
    type NextAuthOptions,
  } from "next-auth";
  import DiscordProvider from "next-auth/providers/discord";
  export const authOptions: NextAuthOptions = {
    callbacks: {
      session: ({ session }) => ({
        ...session,
        user: {
          ...session.user,
        },
      }),
    },
    providers: [
      DiscordProvider({
        clientId: process.env.DISCORD_CLIENT_ID!,
        clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      }),
      /**
       * ...add more providers here.
       *
       * Most other providers require a bit more work than the Discord provider. For example, the
       * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
       * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
       *
       * @see https://next-auth.js.org/providers/github
       */
    ],
  };
  
  /**
   * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
   *
   * @see https://next-auth.js.org/configuration/nextjs
   */
  export const getServerAuthSession = () => getServerSession(authOptions);
  