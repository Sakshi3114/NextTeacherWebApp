// Edge-safe subset of the Auth.js config — no providers here, since the
// Credentials provider needs bcrypt (a native Node module) which can't run
// in the Edge runtime that middleware.js uses. Route handlers and Server
// Components use the full config in lib/auth.js instead.
const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/sign-in",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.image = user.image;
      }
      // Lets the client force a token refresh (useSession().update({ image }))
      // right after an avatar upload, instead of waiting for the next login —
      // see lib/actions/profile-actions.js.
      if (trigger === "update" && session?.image !== undefined) {
        token.image = session.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.image = token.image;
      }
      return session;
    },
  },
};

export default authConfig;
